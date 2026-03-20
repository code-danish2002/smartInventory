export const commonSelectProps = {
  menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
  menuPosition: 'absolute',
  styles: {
    menuPortal: base => ({ ...base, zIndex: 10000 }),
    control: base => ({
      ...base,
      minHeight: '42px',
      maxHeight: '65px',
      overflowY: 'auto',
      backgroundColor: 'var(--select-bg)',
      borderColor: 'var(--select-border)',
      color: 'var(--select-text)',
      '&:hover': { borderColor: 'var(--select-hover)' }
    }),
    valueContainer: base => ({ ...base, maxHeight: '65px', overflowY: 'auto' }),
    singleValue: base => ({ ...base, color: 'var(--select-text)' }),
    placeholder: base => ({ ...base, color: 'var(--select-text)', opacity: 0.6 }),
    menu: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', zIndex: 10000, backgroundColor: 'var(--select-menu-bg)' }),
    menuList: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', zIndex: 10000 }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? 'var(--select-option-selected)' : isFocused ? 'var(--select-option-hover)' : 'transparent',
      color: isSelected ? '#ffffff' : 'var(--select-text)',
      cursor: 'pointer',
      '&:active': { backgroundColor: 'var(--select-option-selected)' }
    }),
    input: base => ({
      ...base,
      color: 'var(--select-text)',
      '& input': {
        outline: 'none !important',
        boxShadow: 'none !important',
      }
    }),
    indicatorSeparator: base => ({ ...base, display: 'none' }),
    indicatorsContainer: base => ({ ...base }),
    multiValue: base => ({ ...base, maxWidth: '95%', backgroundColor: 'var(--select-option-hover)' }),
    multiValueLabel: base => ({ ...base, color: 'var(--select-text)' }),
    multiValueRemove: base => ({ ...base, color: 'var(--select-text)', '&:hover': { color: '#ef4444', backgroundColor: 'transparent' } }),
  }
};
