export const commonSelectProps = {
    menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
    menuPosition: 'absolute',
    styles: {
      menuPortal: base => ({ ...base, zIndex: 10000 }),
      control: base => ({ ...base, minHeight: '42px', maxHeight: '65px', overflowY: 'auto' }),
      valueContainer: base => ({ ...base, maxHeight: '65px', overflowY: 'auto' }),
      menu: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', zIndex: 10000 }),
      menuList: base => ({ ...base, maxHeight: '200px', overflowY: 'auto', zIndex: 10000 }),
      indicatorSeparator: base => ({ ...base, display: 'none' }),
      indicatorsContainer: base => ({ ...base,  }),
      multiValue: base => ({ ...base, maxWidth: '95%' }),
    }
  };