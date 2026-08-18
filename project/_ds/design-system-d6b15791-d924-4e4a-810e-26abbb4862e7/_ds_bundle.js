/* @ds-bundle: {"format":4,"namespace":"DesignSystem_d6b157","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"CurrencyConverter","sourcePath":"components/marketing/CurrencyConverter.jsx"},{"name":"HeroBand","sourcePath":"components/marketing/HeroBand.jsx"},{"name":"Footer","sourcePath":"components/navigation/Footer.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"cdb29275dba6","components/core/Button.jsx":"248cb2961f28","components/core/Card.jsx":"4639629bdbac","components/core/Checkbox.jsx":"a88beb85631a","components/core/IconButton.jsx":"04710d524649","components/core/Input.jsx":"c7cf5ef9acad","components/core/Switch.jsx":"1ea0efda96dd","components/marketing/CurrencyConverter.jsx":"a2439deeb24b","components/marketing/HeroBand.jsx":"e21c0e41567d","components/navigation/Footer.jsx":"68d5b2d42198","components/navigation/NavBar.jsx":"2f3af5de2180","components/navigation/Tabs.jsx":"f23935563c4b","ui_kits/marketing-site/HomeScreen.jsx":"fff9d70003ac","ui_kits/marketing-site/SendScreen.jsx":"eb5c666fa418"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_d6b157 = window.DesignSystem_d6b157 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const VARIANTS = {
  positive: {
    background: 'var(--color-primary-pale)',
    color: 'var(--color-positive-deep)'
  },
  negative: {
    background: 'var(--color-negative-bg)',
    color: '#ffffff'
  },
  warning: {
    background: 'var(--color-warning)',
    color: 'var(--color-warning-content)'
  }
};
function Badge({
  variant = 'positive',
  children
}) {
  const v = VARIANTS[variant] || VARIANTS.positive;
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      background: v.background,
      color: v.color,
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: '14px',
      lineHeight: '20px',
      padding: '4px 12px',
      borderRadius: 'var(--radius-pill)'
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const PAD = {
  sm: '8px 16px',
  md: '12px 24px',
  lg: '16px 32px'
};
const FS = {
  sm: '14px',
  md: '16px',
  lg: '18px'
};
const VARIANTS = {
  primary: {
    background: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
    border: 'none'
  },
  secondary: {
    background: 'var(--surface-soft)',
    color: 'var(--text-heading)',
    border: 'none'
  },
  tertiary: {
    background: 'var(--surface-canvas)',
    color: 'var(--text-heading)',
    border: '1px solid var(--border-default)'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon = null,
  children,
  onClick
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const bg = disabled ? '#e8ebe6' : active ? variant === 'primary' ? 'var(--color-primary-neutral)' : v.background : hover ? variant === 'primary' ? 'var(--color-primary-hover)' : v.background : v.background;
  return React.createElement('button', {
    onClick: disabled ? undefined : onClick,
    disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: FS[size],
      lineHeight: '24px',
      padding: PAD[size],
      borderRadius: 'var(--radius-xl)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background-color .15s ease, transform .1s ease',
      transform: active ? 'scale(0.97)' : 'scale(1)',
      background: bg,
      color: v.color,
      border: v.border
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
const VARIANTS = {
  content: {
    background: 'var(--surface-canvas)',
    color: 'var(--text-heading)'
  },
  sage: {
    background: 'var(--surface-soft)',
    color: 'var(--text-heading)'
  },
  green: {
    background: 'var(--color-primary-pale)',
    color: 'var(--text-heading)'
  },
  dark: {
    background: 'var(--surface-dark)',
    color: 'var(--color-primary)'
  }
};
function Card({
  variant = 'content',
  children,
  style
}) {
  const v = VARIANTS[variant] || VARIANTS.content;
  return React.createElement('div', {
    style: {
      background: v.background,
      color: v.color,
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      fontFamily: 'var(--font-body)',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked,
  onChange
}) {
  return React.createElement('label', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: 'var(--font-body)',
      fontSize: '16px',
      color: 'var(--text-heading)',
      cursor: 'pointer'
    }
  }, React.createElement('span', {
    onClick: () => onChange && onChange(!checked),
    style: {
      width: '22px',
      height: '22px',
      borderRadius: '6px',
      background: checked ? 'var(--color-primary)' : 'var(--surface-canvas)',
      border: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color .15s ease'
    }
  }, checked && React.createElement('span', {
    style: {
      fontSize: '14px',
      color: 'var(--color-on-primary)'
    }
  }, '✓')), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function IconButton({
  children,
  onClick,
  label
}) {
  const [hover, setHover] = React.useState(false);
  return React.createElement('button', {
    onClick,
    'aria-label': label,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
      borderRadius: 'var(--radius-full)',
      background: hover ? 'var(--surface-soft)' : 'var(--surface-canvas)',
      color: 'var(--text-heading)',
      border: '1px solid var(--border-default)',
      cursor: 'pointer',
      transition: 'background-color .15s ease'
    }
  }, children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = 'text'
}) {
  const [focus, setFocus] = React.useState(false);
  return React.createElement('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      fontFamily: 'var(--font-body)'
    }
  }, label && React.createElement('span', {
    style: {
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, label), React.createElement('input', {
    type,
    value,
    placeholder,
    onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '16px',
      lineHeight: '24px',
      color: 'var(--text-heading)',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-canvas)',
      border: error ? '1px solid var(--color-negative)' : focus ? '2px solid var(--text-heading)' : '1px solid var(--border-default)',
      outline: 'none'
    }
  }), error && React.createElement('span', {
    style: {
      fontSize: '12px',
      color: 'var(--color-negative)'
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
function Switch({
  checked,
  onChange,
  label
}) {
  return React.createElement('label', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: 'var(--font-body)',
      fontSize: '16px',
      color: 'var(--text-heading)',
      cursor: 'pointer'
    }
  }, React.createElement('span', {
    onClick: () => onChange && onChange(!checked),
    style: {
      width: '44px',
      height: '26px',
      borderRadius: 'var(--radius-pill)',
      position: 'relative',
      background: checked ? 'var(--color-primary)' : 'var(--surface-soft)',
      border: '1px solid var(--border-default)',
      transition: 'background-color .15s ease'
    }
  }, React.createElement('span', {
    style: {
      position: 'absolute',
      top: '2px',
      left: checked ? '20px' : '2px',
      width: '20px',
      height: '20px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-canvas)',
      border: '1px solid var(--border-default)',
      transition: 'left .15s ease'
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/marketing/CurrencyConverter.jsx
try { (() => {
function CurrencyConverter({
  fromAmount = '1000',
  fromCurrency = 'RUB',
  toAmount = '10.82',
  toCurrency = 'USD',
  rate = '1 USD = 92,41 ₽'
}) {
  return React.createElement('div', {
    style: {
      background: 'var(--surface-canvas)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '380px'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)'
    }
  }, React.createElement('input', {
    defaultValue: fromAmount,
    style: {
      border: 'none',
      outline: 'none',
      fontSize: '24px',
      fontWeight: 700,
      width: '60%',
      fontFamily: 'var(--font-body)'
    }
  }), React.createElement('span', {
    style: {
      fontWeight: 600
    }
  }, fromCurrency)), React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      background: 'var(--surface-soft)',
      borderRadius: 'var(--radius-md)'
    }
  }, React.createElement('input', {
    defaultValue: toAmount,
    style: {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: '24px',
      fontWeight: 700,
      width: '60%',
      fontFamily: 'var(--font-body)'
    }
  }), React.createElement('span', {
    style: {
      fontWeight: 600
    }
  }, toCurrency)), React.createElement('div', {
    style: {
      fontSize: '12px',
      color: 'var(--text-mute)'
    }
  }, rate));
}
Object.assign(__ds_scope, { CurrencyConverter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/CurrencyConverter.jsx", error: String((e && e.message) || e) }); }

// components/marketing/HeroBand.jsx
try { (() => {
function HeroBand({
  eyebrow,
  title,
  subtitle,
  dark = false,
  children
}) {
  return React.createElement('section', {
    style: {
      background: dark ? 'var(--surface-dark)' : 'var(--surface-soft)',
      color: dark ? 'var(--color-primary)' : 'var(--text-heading)',
      padding: '48px 24px',
      fontFamily: 'var(--font-body)'
    }
  }, eyebrow && React.createElement('div', {
    style: {
      fontSize: '14px',
      fontWeight: 600,
      marginBottom: '16px',
      color: dark ? 'var(--color-primary)' : 'var(--text-body)'
    }
  }, eyebrow), React.createElement('h1', {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '64px',
      lineHeight: '54.4px',
      margin: '0 0 16px'
    }
  }, title), subtitle && React.createElement('p', {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '20px',
      lineHeight: '30px',
      maxWidth: '560px',
      color: dark ? 'var(--text-on-dark)' : 'var(--text-body)',
      margin: '0 0 24px'
    }
  }, subtitle), children);
}
Object.assign(__ds_scope, { HeroBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/marketing/HeroBand.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Footer.jsx
try { (() => {
function Footer({
  columns = [{
    title: 'Продукт',
    items: ['Переводы', 'Курсы', 'Тарифы']
  }, {
    title: 'Компания',
    items: ['О нас', 'Карьера', 'Пресса']
  }, {
    title: 'Поддержка',
    items: ['Помощь', 'Контакты']
  }]
}) {
  return React.createElement('footer', {
    style: {
      background: 'var(--surface-dark)',
      color: 'var(--text-on-dark)',
      padding: '48px 24px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      gap: '64px',
      flexWrap: 'wrap'
    }
  }, columns.map((c, i) => React.createElement('div', {
    key: i,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  }, React.createElement('span', {
    style: {
      fontWeight: 600,
      fontSize: '14px',
      color: 'var(--color-primary)'
    }
  }, c.title), c.items.map((it, j) => React.createElement('a', {
    key: j,
    href: '#',
    style: {
      fontSize: '14px',
      color: 'var(--text-on-dark)',
      textDecoration: 'none'
    }
  }, it)))));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Footer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function NavBar({
  links = ['Отправить', 'Курсы', 'О нас'],
  cta = 'Войти'
}) {
  return React.createElement('nav', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--surface-canvas)',
      color: 'var(--text-heading)',
      padding: '12px 24px',
      fontFamily: 'var(--font-body)'
    }
  }, React.createElement('span', {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '20px'
    }
  }, 'Зелёная'), React.createElement('div', {
    style: {
      display: 'flex',
      gap: '24px',
      alignItems: 'center'
    }
  }, links.map((l, i) => React.createElement('a', {
    key: i,
    href: '#',
    style: {
      fontWeight: 600,
      fontSize: '14px',
      color: 'var(--text-heading)',
      textDecoration: 'none'
    }
  }, l)), React.createElement('a', {
    href: '#',
    style: {
      fontWeight: 600,
      fontSize: '14px',
      color: 'var(--text-heading)',
      textDecoration: 'none'
    }
  }, cta)));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  tabs = ['Личный', 'Бизнес'],
  active = 0,
  onChange
}) {
  const [sel, setSel] = React.useState(active);
  const pick = i => {
    setSel(i);
    onChange && onChange(i);
  };
  return React.createElement('div', {
    style: {
      display: 'inline-flex',
      gap: '4px',
      background: 'var(--surface-soft)',
      borderRadius: 'var(--radius-xl)',
      padding: '4px'
    }
  }, tabs.map((t, i) => React.createElement('button', {
    key: i,
    onClick: () => pick(i),
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: '14px',
      padding: '8px 20px',
      borderRadius: 'var(--radius-xl)',
      border: 'none',
      cursor: 'pointer',
      background: sel === i ? 'var(--surface-canvas)' : 'transparent',
      color: 'var(--text-heading)'
    }
  }, t)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/HomeScreen.jsx
try { (() => {
function HomeScreen({
  onStartSend
}) {
  const {
    NavBar,
    HeroBand,
    CurrencyConverter,
    Button,
    Card,
    Badge,
    Footer
  } = window.DesignSystem_d6b157;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement(NavBar, {
    links: ['Отправить', 'Курсы', 'Тарифы', 'О нас'],
    cta: "\u0412\u043E\u0439\u0442\u0438"
  }), /*#__PURE__*/React.createElement(HeroBand, {
    eyebrow: "\u041C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u044B",
    title: "\u0414\u0435\u043D\u044C\u0433\u0438 \u0431\u0435\u0437 \u0433\u0440\u0430\u043D\u0438\u0446",
    subtitle: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0439\u0442\u0435 \u043F\u043E \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u043A\u0443\u0440\u0441\u0443 \u2014 \u0431\u0435\u0437 \u0441\u043A\u0440\u044B\u0442\u044B\u0445 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u0439 \u0438 \u043D\u0430\u0446\u0435\u043D\u043E\u043A."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '32px',
      flexWrap: 'wrap',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: onStartSend
  }, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043F\u0435\u0440\u0435\u0432\u043E\u0434"), /*#__PURE__*/React.createElement(Badge, {
    variant: "positive"
  }, "\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043E\u0442 0,4%")), /*#__PURE__*/React.createElement(CurrencyConverter, null))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-canvas)',
      padding: '48px 24px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-display-md",
    style: {
      marginBottom: '32px'
    }
  }, "\u041F\u043E\u0447\u0435\u043C\u0443 \u0432\u044B\u0431\u0438\u0440\u0430\u044E\u0442 \u043D\u0430\u0441"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: '24px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "sage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-display-xs",
    style: {
      marginBottom: '8px'
    }
  }, "\u0420\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u0443\u0440\u0441"), /*#__PURE__*/React.createElement("p", {
    className: "text-body-md",
    style: {
      color: 'var(--text-body)'
    }
  }, "\u0422\u043E\u0442 \u0441\u0430\u043C\u044B\u0439 \u043A\u0443\u0440\u0441, \u0447\u0442\u043E \u0432\u044B \u0432\u0438\u0434\u0438\u0442\u0435 \u0432 Google \u2014 \u0431\u0435\u0437 \u043D\u0430\u0446\u0435\u043D\u043E\u043A \u0431\u0430\u043D\u043A\u0430.")), /*#__PURE__*/React.createElement(Card, {
    variant: "green"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-display-xs",
    style: {
      marginBottom: '8px'
    }
  }, "\u041F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u044B\u0435 \u0442\u0430\u0440\u0438\u0444\u044B"), /*#__PURE__*/React.createElement("p", {
    className: "text-body-md",
    style: {
      color: 'var(--text-body)'
    }
  }, "\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u0432\u0438\u0434\u043D\u0430 \u0437\u0430\u0440\u0430\u043D\u0435\u0435, \u0434\u043E \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430.")), /*#__PURE__*/React.createElement(Card, {
    variant: "dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-display-xs",
    style: {
      marginBottom: '8px'
    }
  }, "\u0411\u044B\u0441\u0442\u0440\u043E"), /*#__PURE__*/React.createElement("p", {
    className: "text-body-md",
    style: {
      color: 'var(--z-canvas-soft)'
    }
  }, "\u0411\u043E\u043B\u044C\u0448\u0438\u043D\u0441\u0442\u0432\u043E \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u043E\u0432 \u043F\u0440\u0438\u0445\u043E\u0434\u044F\u0442 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u043C\u0438\u043D\u0443\u0442.")))), /*#__PURE__*/React.createElement(Footer, null));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/SendScreen.jsx
try { (() => {
function SendScreen({
  onBack,
  onDone
}) {
  const {
    NavBar,
    Input,
    Button,
    Card,
    Badge
  } = window.DesignSystem_d6b157;
  const [step, setStep] = React.useState(0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      minHeight: '520px',
      background: 'var(--surface-soft)'
    }
  }, /*#__PURE__*/React.createElement(NavBar, {
    links: ['Отправить', 'Курсы', 'Тарифы', 'О нас'],
    cta: "\u0412\u043E\u0439\u0442\u0438"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '480px',
      margin: '0 auto',
      padding: '48px 24px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-display-md",
    style: {
      marginBottom: '24px'
    }
  }, "\u041D\u043E\u0432\u044B\u0439 \u043F\u0435\u0440\u0435\u0432\u043E\u0434"), step === 0 && /*#__PURE__*/React.createElement(Card, {
    variant: "content"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "\u0421\u0443\u043C\u043C\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F (\u20BD)",
    placeholder: "1000"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "\u041F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044C",
    placeholder: "\u0418\u043C\u044F \u0438 \u0444\u0430\u043C\u0438\u043B\u0438\u044F"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "\u041D\u043E\u043C\u0435\u0440 \u0441\u0447\u0451\u0442\u0430 / \u043A\u0430\u0440\u0442\u044B",
    placeholder: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "tertiary",
    onClick: onBack
  }, "\u041D\u0430\u0437\u0430\u0434"), /*#__PURE__*/React.createElement(Button, {
    onClick: () => setStep(1)
  }, "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C")))), step === 1 && /*#__PURE__*/React.createElement(Card, {
    variant: "content"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-body-md"
  }, "\u0412\u044B \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442\u0435 ", /*#__PURE__*/React.createElement("strong", null, "1 000 \u20BD"), " \u2192 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442 ", /*#__PURE__*/React.createElement("strong", null, "10,82 $")), /*#__PURE__*/React.createElement(Badge, {
    variant: "positive"
  }, "\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F: 4 \u20BD"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "tertiary",
    onClick: () => setStep(0)
  }, "\u041D\u0430\u0437\u0430\u0434"), /*#__PURE__*/React.createElement(Button, {
    onClick: () => setStep(2)
  }, "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u043F\u0435\u0440\u0435\u0432\u043E\u0434")))), step === 2 && /*#__PURE__*/React.createElement(Card, {
    variant: "green"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    variant: "positive"
  }, "\u041F\u0435\u0440\u0435\u0432\u043E\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D"), /*#__PURE__*/React.createElement("div", {
    className: "text-display-xs"
  }, "\u0413\u043E\u0442\u043E\u0432\u043E!"), /*#__PURE__*/React.createElement("p", {
    className: "text-body-md",
    style: {
      color: 'var(--text-body)'
    }
  }, "\u041F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u0445 \u043C\u0438\u043D\u0443\u0442."), /*#__PURE__*/React.createElement(Button, {
    onClick: onDone
  }, "\u041D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E")))));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/SendScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.CurrencyConverter = __ds_scope.CurrencyConverter;

__ds_ns.HeroBand = __ds_scope.HeroBand;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.NavBar = __ds_scope.NavBar;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
