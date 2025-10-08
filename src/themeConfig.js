// فایل تنظیمات تم‌های لایت و دارک
export const lightTheme = {
  name: 'light',
  colors: {
    // رنگ‌های اصلی
    primary: '#031E36',
    primaryDark: '#5a6fd8',
    secondary: '#764ba2',
    accent: '#CB3CFF',
    logoColor:'#031E36',
    
    // رنگ‌های پس‌زمینه
    bgcolor: '#fff',
    surface: '#FFFFFF',
    headerBg: '#031E36',
    cardBg: '#FFFFFF',
    uploadArea:'transparent',
    
    // رنگ‌های متن
    textPrimary: '#212121',
    textSecondary: '#757575',
    textInverse: '#212121',
    textMuted: '#6c757d',
    swalTitle:'#212121',
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
    colorDisabled:'#BDBDBD',
    
    // رنگ‌های خاص کامپوننت‌ها
    uploadAreaBg: 'rgba(20, 55, 90, 0.1)',
    uploadAreaBorder: '#031E36',
    stepBg: 'rgba(255, 255, 255, 0.2)',
    stepActiveBg: '#4CAF50',
    operationCardBg: 'transparent',
    operationCardBorder: '#e9ecef',
    modalBg: '#FFFFFF',
    modalHeaderBg: '#f8f9fa',
    stepBgLine:'#E0E0E0',
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
    logoColor:'#fff',
    // رنگ‌های پس‌زمینه-webkit-linear-gradient(to right, #',
    surface: '#ffffff',
    headerBg: '#0d1a30',
    cardBg: 'rgba(3, 30, 54, .8)',
    bgcolor:'#0F2027',
    uploadArea:'transparent',
    // رنگ‌های متن
    textPrimary: '#ffffff',
    textSecondary: '#b8b9c7',
    textInverse: '#fff',
    textMuted: '#8a8da3',
    optTitles:'#212121',
    swalTitle:'#212121',
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
    borderLight: '#1e2339',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    
    // رنگ‌های دکمه‌ها
    btnPrimary: '#EC407A',
    btnPrimaryHover: '#b84de6',
    btnSecondary: '#ffc94d',
    btnSecondaryHover: '#4dc9ff',
    
    // رنگ‌های خاص کامپوننت‌ها
    uploadAreaBg: 'rgba(137, 81, 255, 0.1)',
    uploadAreaBorder: '#a371ff',
    stepBg: 'rgba(255, 255, 255, 0.1)',
    stepActiveBg: '#4CAF50',
    operationCardBg: 'rgba(255, 255, 255, 0.05)',
    operationCardBorder: '#2a2f4c',
    modalBg: '#1a1f3c',
    modalHeaderBg: '#0d1a30',
    stepBgLine:'#E0E0E0',
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
};

// تابع برای دریافت تم فعلی
export const getCurrentTheme = () => {
  return localStorage.getItem('preferred-theme') || 'light';
};

// تابع برای ذخیره تم
export const saveTheme = (theme) => {
  localStorage.setItem('preferred-theme', theme);
};