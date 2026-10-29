export function initMathCopy({ doc = document, texts, copy }) {
  for (const formula of doc.querySelectorAll('.article-body [data-math-source]')) {
    formula.classList.add('math-copy');
    formula.setAttribute('role', 'button');
    formula.tabIndex = 0;
    formula.title = texts.copy_formula;
    const svg = formula.querySelector('svg');
    formula.setAttribute('aria-label', texts.copy_formula + ': ' + (svg?.getAttribute('aria-label') || formula.dataset.mathSource));
    const title = svg?.querySelector('title');
    if (title) title.textContent = texts.copy_formula;

    const copyFormula = () => copy(formula.dataset.mathSource, texts.formula_copied, {
      failureMessage: texts.formula_copy_failed,
      label: texts.copy_formula,
      multiline: true
    });
    formula.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      copyFormula();
    });
    formula.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) copyFormula();
    });
  }
}
