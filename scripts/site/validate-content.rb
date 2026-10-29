# frozen_string_literal: true
require "yaml"
require "date"
require "time"

module SiteValidation
  module_function

  def documents(directory, base)
    Dir[File.join(base, directory, "**", "*.md")].map do |file|
      raw = File.read(file, encoding: "UTF-8")
      match = raw.match(/\A---\s*\n(.*?)\n---/m)
      raise "#{file}: missing YAML front matter" unless match
      data = YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
      [file, data]
    end
  end

  def validate(base)
    config = YAML.safe_load(File.read(File.join(base, "_config.yml")), aliases: true) || {}
    content_root = File.join(base, config.fetch("collections_dir", ""))
    courses = documents("_courses", content_root)
    notes = documents("_notes", content_root)
    (documents("_posts", content_root) + notes + courses).each do |file, data|
      folder_lang = file.delete_prefix("#{content_root}/").split("/")[1]
      raise "#{file}: language must match its en/ru folder" unless %w[en ru].include?(folder_lang) && data["lang"] == folder_lang
      next if data["redirect_to"]
      raise "#{file}: creation date is required" if data["date"].to_s.empty?
      begin
        Time.parse(data["date"].to_s)
        Time.parse(data["last_modified_at"].to_s) if data["last_modified_at"]
      rescue ArgumentError
        raise "#{file}: invalid creation or update timestamp"
      end
    end
    seen_routes = {}
    seen_refs = {}
    (courses + notes).each do |file, data|
      %w[title lang lang_ref permalink].each { |key| raise "#{file}: #{key} is required" if data[key].to_s.strip.empty? }
      raise "#{file}: lang must be en or ru" unless %w[en ru].include?(data["lang"])
      raise "#{file}: lang_ref must be a stable slug" unless data["lang_ref"].match?(/\A[a-z0-9_-]+\z/)
      prefix = data["lang"] == "ru" ? "/ru/library/" : "/library/"
      raise "#{file}: permalink must begin with #{prefix} and end with /" unless data["permalink"].start_with?(prefix) && data["permalink"].end_with?("/")
      raise "#{file}: duplicate permalink" if seen_routes[data["permalink"]]
      seen_routes[data["permalink"]] = true
      ref = [data["lang"], data["lang_ref"]]
      raise "#{file}: duplicate translation reference in one language" if seen_refs[ref]
      seen_refs[ref] = true
    end
    course_keys = {}
    courses.each do |file, data|
      raise "#{file}: topics must be a list of strings" unless data["topics"].is_a?(Array) && data["topics"].all? { |topic| topic.is_a?(String) && !topic.strip.empty? }
      raise "#{file}: status must be in_progress or complete" unless %w[in_progress complete].include?(data["status"])
      %w[course_id description source_author source_url].each { |key| raise "#{file}: #{key} is required" if data[key].to_s.strip.empty? }
      raise "#{file}: source_url must be an absolute web URL" unless data["source_url"].match?(/\Ahttps?:\/\//)
      if data.key?("materials")
        materials = data["materials"]
        valid = materials.is_a?(Array) && !materials.empty? && materials.all? do |material|
          material.is_a?(Hash) && material["title"].is_a?(String) && !material["title"].strip.empty? &&
            material["url"].is_a?(String) && material["url"].match?(/\Ahttps?:\/\//)
        end
        raise "#{file}: materials must be a nonempty list of titles and absolute web URLs" unless valid
      end
      raise "#{file}: invalid course permalink" unless data["permalink"].match?(/\A(?:\/ru)?\/library\/[a-z0-9-]+\/\z/)
      key = [data["lang"], data["course_id"]]
      raise "#{file}: duplicate course ID" if course_keys[key]
      course_keys[key] = true
    end
    orders = {}
    notes.each do |file, data|
      key = [data["lang"], data["course"]]
      raise "#{file}: course must exist in the same language" unless course_keys[key]
      course = courses.find { |_, item| [item["lang"], item["course_id"]] == key }[1]
      note_path = data["permalink"].delete_prefix(course["permalink"])
      raise "#{file}: note URL must be one slug inside its course URL" unless data["permalink"].start_with?(course["permalink"]) && note_path.match?(/\A[a-z0-9-]+\/\z/)
      raise "#{file}: order must be a positive integer" unless data["order"].is_a?(Integer) && data["order"] > 0
      order_key = key + [data["order"]]
      raise "#{file}: duplicate order within course" if orders[order_key]
      orders[order_key] = true
    end
    puts "Content metadata valid (#{courses.length} courses, #{notes.length} notes)."
  end
end
