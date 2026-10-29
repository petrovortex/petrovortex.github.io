# frozen_string_literal: true
require "bundler/setup"
require "jekyll"
require_relative "site/validate-content"
require "fileutils"

ROOT = File.expand_path("..", __dir__)
Dir.chdir(ROOT)
command = ARGV.shift || "serve"

if %w[build serve].include?(command)
  abort "Content exports failed." unless system("node", File.join(ROOT, "scripts", "content.mjs"), "--exports-only")
end
SiteValidation.validate(ROOT)
case command
when "validate"
  # Validation only.
when "build"
  Jekyll::Commands::Build.process({ "trace" => true })
when "serve"
  # Fixed canonical site URL, preview-only engagement, no live Firebase writes.
  options = {
    "host" => "127.0.0.1", "port" => 4000, "watch" => true,
    "engagement_mode" => "preview", "skip_initial_build" => false, "serving" => true
  }
  Jekyll::Commands::Build.process(options)
  Jekyll::Commands::Serve.process(options)
when "fixtures"
  fixture_source = File.join(ROOT, ".preview", "fixture-source")
  # This generated staging directory must not retain moved or deleted sources.
  if File.exist?(fixture_source)
    raise "Unexpected fixture source path" unless File.realpath(fixture_source) == File.expand_path(fixture_source)
    FileUtils.remove_entry(fixture_source)
  end
  FileUtils.mkdir_p(fixture_source)
  %w[_config.yml _layouts _includes _data assets pages].each do |name|
    FileUtils.cp_r(File.join(ROOT, name), fixture_source)
  end
  content_dir = Jekyll.configuration({ "config" => File.join(ROOT, "_config.yml") })["collections_dir"]
  fixture_content = File.join(fixture_source, content_dir)
  FileUtils.mkdir_p(fixture_content)
  FileUtils.cp_r(File.join(ROOT, content_dir, "_posts"), fixture_content)
  %w[_courses _notes _posts].each do |name|
    source_dir = File.join(ROOT, "tests", "fixtures", "content", name)
    Dir[File.join(source_dir, "**", "*.md")].each do |file|
      target = File.join(fixture_content, name, file.delete_prefix("#{source_dir}/"))
      FileUtils.mkdir_p(File.dirname(target))
      FileUtils.cp(file, target)
    end
  end
  config = Jekyll.configuration({
    "config" => File.join(ROOT, "_config.yml"),
    "source" => fixture_source,
    "destination" => File.join(ROOT, ".preview", "fixture-site"),
    "engagement_mode" => "preview"
  })
  SiteValidation.validate(fixture_source)
  Dir.chdir(fixture_source) { Jekyll::Site.new(config).process }
  puts "Synthetic library fixtures built under .preview/fixture-site (excluded from publication)."
else
  abort "Usage: ruby scripts/site.rb [serve|build|validate|fixtures]"
end
