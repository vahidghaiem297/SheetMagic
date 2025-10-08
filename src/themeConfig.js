// فایل تنظیمات تم‌های لایت و دارک
export const lightTheme = {
  name: 'light',
  colors: {
    // رنگ‌های اصلی
    primary: '#031E36',
    primaryDark: '#5a6fd8',
    secondary: '#764ba2',
    accent: '#CB3CFF',
    logoColor: '#031E36',
    
    // رنگ‌های پس‌زمینه
    bgcolor: '#fff',
    surface: '#FFFFFF',
    headerBg: '#031E36',
    cardBg: '#FFFFFF',
    uploadArea: 'transparent',
    
    // رنگ‌های متن
    textPrimary: '#212121',
    textSecondary: '#757575',
    textInverse: '#212121',
    textMuted: '#6c757d',
    optTitles: '#212121', // عناوین عملیات
    swalTitle: '#212121', // عنوان SweetAlert
    
    // رنگ‌های وضعیت
    success: '#4CAF50',
    successLight: '#e8f5e8',
    error: '#dc3545',
    errorLight: '#f8d7da',
    warning: '#ffc107',
    warningLight: '#fff3cd',
    info: '#17a2b8',
    infoLight: '#d1ecf1',
    
    // رنگ‌های border و shadow
    border: '#e9ecef',
    borderLight: '#f8f9fa',
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'hsla(0, 0%, 0%, 0.05)',
    
    // رنگ‌های دکمه‌ها
    btnPrimary: '#EC407A',
    btnPrimaryHover: '#7F25FB',
    btnSecondary: '#FDB52A',
    btnSecondaryHover: '#21C3FC',
    btnDisabled: 'rgba(189, 189, 189, .2)',
    colorDisabled: '#BDBDBD',
    btnWorkflow: 'rgba(3, 30, 54, 0.1)', // دکمه‌های workflow
    
    // رنگ‌های خاص کامپوننت‌ها
    uploadAreaBg: 'rgba(20, 55, 90, 0.1)',
    uploadAreaBorder: '#031E36',
    stepBg: 'rgba(255, 255, 255, 0.2)',
    stepActiveBg: '#4CAF50',
    operationCardBg: 'transparent',
    operationCardBorder: '#e9ecef',
    modalBg: '#FFFFFF',
    modalHeaderBg: '#f8f9fa',
    stepBgLine: '#E0E0E0',
    
    // رنگ‌های اضافی برای consistency
    stepNumberBg: '#E0E0E0',
    stepNumberColor: '#212121',
    filePreviewBg: '#f9f9f9',
    filePreviewBorder: '#e9ecef',
    selectBg: '#FFFFFF',
    selectBorder: '#e9ecef',
    selectColor: '#212121'
  }
};

export const darkTheme = {
  name: 'dark',
  colors: {
    // رنگ‌های اصلی
    primary: '#031E36',
    primaryDark: '#7b8ef0',
    secondary: '#9d6bd9',
    accent: '#d96bff',
    logoColor: '#ffffff',
    
    // رنگ‌های پس‌زمینه
    bgcolor: '#0F2027',
    surface: '#fff',
    headerBg: '#0d1a30',
    cardBg: 'rgba(3, 30, 54, 0.8)',
    uploadArea: 'transparent',
    
    // رنگ‌های متن
    textPrimary: '#ffffff',
    textSecondary: '#b8b9c7',
    textInverse: '#ffffff',
    textMuted: '#8a8da3',
    optTitles: '#ffffff', // عناوین روشن برای تم تاریک
    swalTitle: '#ffffff', // عنوان روشن برای SweetAlert
    
    // رنگ‌های وضعیت
    success: '#5cdb60',
    successLight: '#1a3d1a',
    error: '#ff6b7a',
    errorLight: '#3d1a1f',
    warning: '#ffd54f',
    warningLight: '#3d3a1a',
    info: '#4fd1ff',
    infoLight: '#1a2f3d',
    
    // رنگ‌های border و shadow
    border: '#2a2f4c',
    borderLight: '#1e2339',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    
    // رنگ‌های دکمه‌ها
    btnPrimary: '#EC407A',
    btnPrimaryHover: '#b84de6',
    btnSecondary: '#ffc94d',
    btnSecondaryHover: '#4dc9ff',
    btnDisabled: 'rgba(189, 189, 189, 0.2)',
    colorDisabled: '#BDBDBD',
    btnWorkflow: 'rgba(255, 255, 255, 0.1)', // دکمه‌های workflow در تم تاریک
    
    // رنگ‌های خاص کامپوننت‌ها
    uploadAreaBg: 'rgba(137, 81, 255, 0.1)',
    uploadAreaBorder: '#a371ff',
    stepBg: 'rgba(255, 255, 255, 0.1)',
    stepActiveBg: '#4CAF50',
    operationCardBg: 'rgba(255, 255, 255, 0.05)',
    operationCardBorder: '#2a2f4c',
    modalBg: '#1a1f3c',
    modalHeaderBg: '#0d1a30',
    stepBgLine: '#2a2f4c',
    
    // رنگ‌های اضافی برای consistency
    stepNumberBg: '#2a2f4c',
    stepNumberColor: '#ffffff',
    filePreviewBg: '#1e2339',
    filePreviewBorder: '#2a2f4c',
    selectBg: '#1a1f3c',
    selectBorder: '#2a2f4c',
    selectColor: '#ffffff'
  }
};

// تابع برای اعمال تم
export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  // اعمال تمام رنگ‌ها به عنوان CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  // اضافه کردن کلاس برای انیمیشن
  document.body.classList.add('theme-transition');
  setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 300);
  
  // اضافه کردن کلاس به body برای استایل‌های خاص
  if (theme.name === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }
};

// تابع برای دریافت تم فعلی
export const getCurrentTheme = () => {
  return localStorage.getItem('preferred-theme') || 'light';
};

// تابع برای ذخیره تم
export const saveTheme = (theme) => {
  localStorage.setItem('preferred-theme', theme);
};

// تابع برای مقداردهی اولیه تم
export const initializeTheme = () => {
  const savedTheme = getCurrentTheme();
  const themeToApply = savedTheme === 'light' ? lightTheme : darkTheme;
  applyTheme(themeToApply);
  return savedTheme;
};