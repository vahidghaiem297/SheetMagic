import { API_ENDPOINTS } from "./config/api.js";
import { lightTheme, darkTheme, applyTheme, getCurrentTheme, saveTheme } from './themeConfig.js';
import { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'sweetalert2/dist/sweetalert2.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './index.css';
import './fonts/fonts.css';


// تابع برای مدیریت مسیر تصاویر
const getImagePath = (filename) => {
  return `/img/${filename}`;
};

function App() {
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [targetFormat, setTargetFormat] = useState('excel');
  const [comparisonKey, setComparisonKey] = useState('');
  const [cleaningOperation, setCleaningOperation] = useState('');
  const [cleaningParams, setCleaningParams] = useState({
    columnName: '',
    splitType: 'auto',
    phoneFormat: 'international',
  });
  const [pivotParams, setPivotParams] = useState({
    indexColumn: '',
    valuesColumn: '',
    aggregation: 'sum',
  });
  const [joinParams, setJoinParams] = useState({
    leftKey: '',
    rightKey: '',
    joinType: 'inner',
  });

  // State برای مدیریت راهنما
  const [helpModal, setHelpModal] = useState({
    isOpen: false,
    title: '',
    content: '',
    examples: [],
    operationType: ''
  });

  // Stateهای جدید برای مدیریت پروژه
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Refs for Select2 elements
  const selectColumnRef = useRef(null);
  const targetFormatRef = useRef(null);
  const comparisonKeyRef = useRef(null);
  const cleaningOperationRef = useRef(null);
  const cleaningColumnRef = useRef(null);
  const phoneFormatRef = useRef(null);
  const pivotIndexRef = useRef(null);
  const pivotValuesRef = useRef(null);
  const pivotAggregationRef = useRef(null);
  const joinLeftKeyRef = useRef(null);
  const joinRightKeyRef = useRef(null);
  const joinTypeRef = useRef(null);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    saveTheme(newTheme);

    const themeToApply = newTheme === 'light' ? lightTheme : darkTheme;
    applyTheme(themeToApply);
  };

  useEffect(() => {
    // اعمال تم هنگام لود اولیه
    const savedTheme = getCurrentTheme();
    const themeToApply = savedTheme === 'light' ? lightTheme : darkTheme;
    applyTheme(themeToApply);
  }, []);

  const initializeSelect2 = (ref, options = {}) => {
    if (!window.$ || !ref.current) return;

    const $el = $(ref.current);

    if ($el.hasClass('select2-hidden-accessible')) {
      $el.select2('destroy');
    }

    $el
      .select2({
        theme: 'bootstrap-5',
        dir: 'rtl',
        width: '100%',
        dropdownParent: $el.parent(),
        language: { noResults: () => 'نتیجه‌ای یافت نشد' },
        ...options,
      })
      .off('change.select2Fix')
      .on('change.select2Fix', function (e) {
        const value = e.target.value;

        if (ref === selectColumnRef) setSelectedColumn(value);
        else if (ref === targetFormatRef) setTargetFormat(value);
        else if (ref === comparisonKeyRef) setComparisonKey(value);
        else if (ref === cleaningOperationRef) {
          setCleaningOperation(value);
          setCleaningParams((prev) => ({ ...prev, columnName: '' }));
        } else if (ref === cleaningColumnRef) {
          setCleaningParams((prev) => ({ ...prev, columnName: value }));
        } else if (ref === phoneFormatRef) {
          setCleaningParams((prev) => ({ ...prev, phoneFormat: value }));
        } else if (ref === pivotIndexRef) {
          setPivotParams((prev) => ({ ...prev, indexColumn: value }));
        } else if (ref === pivotValuesRef) {
          setPivotParams((prev) => ({ ...prev, valuesColumn: value }));
        } else if (ref === pivotAggregationRef) {
          setPivotParams((prev) => ({ ...prev, aggregation: value }));
        } else if (ref === joinLeftKeyRef) {
          setJoinParams((prev) => ({ ...prev, leftKey: value }));
        } else if (ref === joinRightKeyRef) {
          setJoinParams((prev) => ({ ...prev, rightKey: value }));
        } else if (ref === joinTypeRef) {
          setJoinParams((prev) => ({ ...prev, joinType: value }));
        }
      });
  };

  const destroySelect2 = (ref) => {
    if (window.$ && ref.current) {
      $(ref.current).select2('destroy');
    }
  };

  function initializeAllSelect2() {
    if (selectedOperation === 'remove-duplicates' && availableColumns.length > 0) {
      initializeSelect2(selectColumnRef);
    }

    if (selectedOperation === 'convert') {
      initializeSelect2(targetFormatRef);
    }

    if (selectedOperation === 'compare' && availableColumns.length > 0) {
      initializeSelect2(comparisonKeyRef);
    }

    if (selectedOperation === 'clean-data') {
      initializeSelect2(cleaningOperationRef);

      if (cleaningOperation && availableColumns.length > 0) {
        initializeSelect2(cleaningColumnRef);
      }

      if (cleaningOperation === 'standardize_phone') {
        setTimeout(() => {
          if (phoneFormatRef.current) {
            initializeSelect2(phoneFormatRef);
          }
        }, 100);
      }
    }

    if (selectedOperation === 'pivot-table' && availableColumns.length > 0) {
      initializeSelect2(pivotIndexRef);
      initializeSelect2(pivotValuesRef);
      initializeSelect2(pivotAggregationRef);
    }

    if (selectedOperation === 'join-data' && files.length === 2) {
      if (availableColumns.length > 0) {
        setTimeout(() => {
          initializeSelect2(joinLeftKeyRef);
          initializeSelect2(joinRightKeyRef);
          initializeSelect2(joinTypeRef);
        }, 100);
      }
    }
  }

  useEffect(() => {
    if (selectedOperation !== 'clean-data') return;

    if (cleaningOperation === 'standardize_phone' && cleaningParams.columnName) {
      setTimeout(() => {
        if (phoneFormatRef.current) {
          initializeSelect2(phoneFormatRef);
        }
      }, 100);
    } else {
      destroySelect2(phoneFormatRef);
    }
  }, [selectedOperation, cleaningOperation, cleaningParams.columnName]);

  useEffect(() => {
    if (selectedOperation === 'convert' && files.length === 1) {
      const tf =
        files[0].name.toLowerCase().endsWith('.csv') ? 'excel' : 'csv';
      setTargetFormat(tf);

      if (window.$ && targetFormatRef.current) {
        $(targetFormatRef.current).val(tf).trigger('change');
      }
    }
  }, [files, selectedOperation]);

  useEffect(() => {
    const loadSelect2 = () => {
      if (!window.jQuery) {
        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';

        jqueryScript.onload = () => {
          const select2Script = document.createElement('script');
          select2Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.1.0-rc.0/js/select2.min.js';
          select2Script.onload = () => {
            const select2Css = document.createElement('link');
            select2Css.rel = 'stylesheet';
            select2Css.href = 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.1.0-rc.0/css/select2.min.css';
            document.head.appendChild(select2Css);

            initializeAllSelect2();
          };
          document.head.appendChild(select2Script);
        };
        document.head.appendChild(jqueryScript);
      } else {
        initializeAllSelect2();
      }
    };

    loadSelect2();

    return () => {
      destroySelect2(selectColumnRef);
      destroySelect2(targetFormatRef);
      destroySelect2(comparisonKeyRef);
      destroySelect2(cleaningOperationRef);
      destroySelect2(cleaningColumnRef);
      destroySelect2(phoneFormatRef);
      destroySelect2(pivotIndexRef);
      destroySelect2(pivotValuesRef);
      destroySelect2(pivotAggregationRef);
      destroySelect2(joinLeftKeyRef);
      destroySelect2(joinRightKeyRef);
      destroySelect2(joinTypeRef);
    };
  }, []);

  useEffect(() => {
    if (window.$) {
      setTimeout(initializeAllSelect2, 100);
    }
  }, [availableColumns, currentStep, selectedOperation, cleaningOperation, pivotParams, joinParams]);

  useEffect(() => {
    const savedWorkflows = localStorage.getItem('excel-automator-workflows');
    if (savedWorkflows) {
      setWorkflows(JSON.parse(savedWorkflows));
    }
  }, []);

  const showAlert = (title, text, icon = 'info') =>
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'متوجه شدم',
      confirmButtonColor: '#667eea',
      customClass: { popup: 'swal2-rtl' },
    });

  const showSuccess = (title, text) => showAlert(title, text, 'success');
  const showError = (title, text) => showAlert(title, text, 'error');
  const showWarning = (title, text) => showAlert(title, text, 'warning');
  const showConfirm = (title, text) =>
    Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'خیر',
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#6c757d',
      customClass: { popup: 'swal2-rtl' },
    });

  const showHelp = (operation) => {
    const helpData = getHelpData(operation);
    setHelpModal({
      isOpen: true,
      title: helpData.title,
      content: helpData.content,
      examples: helpData.examples || [],
      operationType: operation
    });
  };

  const closeHelp = () => {
    setHelpModal({
      isOpen: false,
      title: '',
      content: '',
      examples: [],
      operationType: ''
    });
  };

  const getHelpData = (operation) => {
    const helpMap = {
      'merge': {
        title: '🧩 ادغام فایل‌ها',
        content: 'این عملیات چندین فایل Excel یا CSV را در یک فایل واحد ادغام می‌کند. تمام داده‌ها از فایل‌های مختلف در یک فایل جدید ترکیب می‌شوند.',
        examples: [
          '📊 فایل۱: لیست کارمندان بخش فروش (50 سطر)',
          '📊 فایل۲: لیست کارمندان بخش مالی (30 سطر)',
          '✅ نتیجه: یک فایل حاوی 80 سطر با تمام کارمندان'
        ]
      },
      'remove-duplicates': {
        title: '🔍 حذف تکراری‌ها',
        content: 'سطرهای تکراری را از فایل حذف می‌کند. می‌توانید بر اساس یک ستون خاص یا تمام ستون‌ها تکراری‌ها را حذف کنید.',
        examples: [
          '📥 ورودی: 100 سطر با 5 سطر تکراری',
          '🎯 ستون انتخاب شده: کد ملی',
          '✅ نتیجه: 95 سطر منحصر به فرد',
          '💡 نکته: اگر ستون انتخاب نشود، تمام ستون‌ها بررسی می‌شوند'
        ]
      },
      'convert': {
        title: '🔄 تبدیل فرمت',
        content: 'فایل‌ها را بین فرمت‌های CSV و Excel تبدیل می‌کند. این قابلیت برای سازگاری با سیستم‌های مختلف مفید است.',
        examples: [
          '📥 ورودی: فایل CSV با 5000 سطر',
          '🎯 فرمت هدف: Excel',
          '✅ نتیجه: فایل Excel با ساختار مشابه',
          '💡 کاربرد: تبدیل داده‌ها برای استفاده در نرم‌افزارهای مختلف'
        ]
      },

      'compare': {
        title: '⚖️ مقایسه فایل‌ها',
        content: 'دو فایل را مقایسه کرده و تفاوت‌ها را شناسایی می‌کند. می‌توانید بر اساس کلید خاص یا تمام داده‌ها مقایسه کنید.',
        examples: [
          '📊 فایل۱: داده‌های دیروز (1000 سطر)',
          '📊 فایل۲: داده‌های امروز (1050 سطر)',
          '✅ نتیجه: شناسایی 50 سطر جدید و 10 سطر تغییر یافته',
          '🎯 خروجی: فایل با هایلایت تفاوت‌ها'
        ]
      },
      'clean-data': {
        title: '✨ تمیز کردن داده',
        content: 'داده‌ها را استانداردسازی و پاکسازی می‌کند. شامل جداسازی نام، استانداردسازی تلفن، حذف فاصله اضافی و استانداردسازی تاریخ.',
        examples: [
          '🔧 عملیات: جداسازی نام و نام خانوادگی',
          '📥 ورودی: "محمد رضایی" در یک ستون',
          '✅ نتیجه: "محمد" در ستون نام، "رضایی" در ستون نام خانوادگی',
          '🎯 سایر قابلیت‌ها: استانداردسازی تلفن، تاریخ و پاکسازی متن'
        ]
      },
      'pivot-table': {
        title: '📊 جدول محوری',
        content: 'برای خلاصه‌سازی و تجزیه تحلیل داده‌ها استفاده می‌شود. داده‌ها را بر اساس معیارهای مختلف گروه‌بندی و محاسبه می‌کند.',
        examples: [
          '🏙️ ستون ایندکس: شهر',
          '💰 ستون مقادیر: فروش',
          '📈 نوع محاسبه: جمع',
          '✅ نتیجه: جمع فروش هر شهر به صورت جداگانه'
        ]
      },
      'join-data': {
        title: '🔗 ترکیب داده‌ها',
        content: 'دو جدول را بر اساس ستون کلید مشترک ترکیب می‌کند. انواع مختلف JOIN برای نیازهای مختلف در دسترس است.',
        examples: [
          '👥 جدول۱: اطلاعات کارمندان (1000 رکورد)',
          '💰 جدول۲: حقوق کارمندان (1000 رکورد)',
          '🔑 کلید مشترک: کد پرسنلی',
          '✅ نتیجه: یک جدول کامل با 1000 رکورد حاوی تمام اطلاعات'
        ]
      }
    };

    return helpMap[operation] || {
      title: '❓ راهنما',
      content: 'توضیحاتی برای این عملیات موجود نیست.',
      examples: ['اطلاعات بیشتری در دسترس نیست']
    };
  };

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      await showWarning('خطا', 'لطفاً نامی برای پروژه وارد کنید');
      return;
    }

    const workflow = {
      id: Date.now().toString(),
      name: workflowName,
      timestamp: new Date().toLocaleString('fa-IR'),
      steps: {
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        selectedOperation,
        selectedColumn,
        comparisonKey,
        cleaningOperation,
        cleaningParams,
        pivotParams,
        joinParams,
        targetFormat,
        availableColumns
      }
    };

    const updatedWorkflows = [...workflows, workflow];
    setWorkflows(updatedWorkflows);
    localStorage.setItem('excel-automator-workflows', JSON.stringify(updatedWorkflows));

    setShowSaveModal(false);
    setWorkflowName('');
    await showSuccess('ذخیره شد', `پروژه "${workflowName}" با موفقیت ذخیره شد`);
  };

  const loadWorkflow = (workflow) => {
    setCurrentWorkflow(workflow);
    const { steps } = workflow;

    setSelectedOperation(steps.selectedOperation);
    setSelectedColumn(steps.selectedColumn || '');
    setComparisonKey(steps.comparisonKey || '');
    setCleaningOperation(steps.cleaningOperation || '');
    setCleaningParams(steps.cleaningParams || { columnName: '', phoneFormat: 'international' });
    setPivotParams(steps.pivotParams || { indexColumn: '', valuesColumn: '', aggregation: 'sum' });
    setJoinParams(steps.joinParams || { leftKey: '', rightKey: '', joinType: 'inner' });
    setTargetFormat(steps.targetFormat || 'excel');
    setAvailableColumns(steps.availableColumns || []);

    // اگر فایل‌هایی از قبل آپلود شده‌اند، برو مرحله ۲
    // اگر نه، بمان مرحله ۱ برای آپلود فایل‌های جدید
    if (files.length > 0) {
      setCurrentStep(2);
      showSuccess('بارگذاری شد', `پروژه "${workflow.name}" بارگذاری شد و آماده پردازش است.`);
    } else {
      setCurrentStep(1); // بمان در مرحله ۱ برای آپلود فایل‌های جدید
      showSuccess('بارگذاری شد', `پروژه "${workflow.name}" بارگذاری شد. لطفاً فایل‌های جدید را در این مرحله انتخاب کنید.`);
    }

    setShowLoadModal(false);
  };

  const deleteWorkflow = async (workflowId) => {
    const confirm = await showConfirm('حذف پروژه', 'آیا مطمئن هستید که می‌خواهید این پروژه را حذف کنید؟');
    if (!confirm.isConfirmed) return;

    const updatedWorkflows = workflows.filter(w => w.id !== workflowId);
    setWorkflows(updatedWorkflows);
    localStorage.setItem('excel-automator-workflows', JSON.stringify(updatedWorkflows));
    await showSuccess('حذف شد', 'پروژه با موفقیت حذف شد');
  };

  const extractColumnsFromFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_ENDPOINTS.GET_COLUMNS}`, formData, {
        timeout: 0,
      });

      setAvailableColumns((prev) => {
        const merged = [...prev, ...response.data.columns];
        return [...new Set(merged)];
      });
    } catch (error) {
      console.error(`Error extracting columns from ${file.name}:`, error?.message || error);
      if (files.length <= 1) setAvailableColumns([]);
      if (error.code === 'ECONNABORTED') {
        await showError('خطا', 'پاسخ سرور دیر شد (Timeout). لطفاً دوباره تلاش کنید.');
      } else if (error.response) {
        await showError('خطا', `خطا در خواندن فایل ${file.name}: ${error.response.data?.error || 'Server error'}`);
      } else {
        await showError('خطا', 'اتصال به سرور برقرار نشد.');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    onDrop: async (acceptedFiles, rejectedFiles) => {
      // بررسی فایل‌های رد شده
      if (rejectedFiles.length > 0) {
        await showError(
          'فرمت فایل نامعتبر',
          'فقط فایل‌های Excel (.xlsx, .xls) و CSV (.csv) مجاز هستند.'
        );
        return;
      }

      setFiles(acceptedFiles);

      if (acceptedFiles.length > 0) {
        setAvailableColumns([]);
        (async () => {
          for (const f of acceptedFiles) {
            const n = f.name.toLowerCase();
            if (n.endsWith('.xlsx') || n.endsWith('.xls') || n.endsWith('.csv')) {
              await extractColumnsFromFile(f);
            }
          }
        })();
      } else {
        setAvailableColumns([]);
      }

      if (currentStep === 1) setCurrentStep(2);
    },
  });

  const handleOperationSelect = (operation) => {
    setSelectedOperation(operation);

    if (operation === 'convert') {
      const tf = files[0]?.name?.toLowerCase().endsWith('.csv') ? 'excel' : 'csv';
      setTargetFormat(tf);
    } else if (operation === 'clean-data') {
      setCleaningOperation('');
      setCleaningParams({ columnName: '', splitType: 'auto', phoneFormat: 'international' });
    } else if (operation === 'pivot-table') {
      setPivotParams({ indexColumn: '', valuesColumn: '', aggregation: 'sum' });
    } else if (operation === 'join-data') {
      setJoinParams({ leftKey: '', rightKey: '', joinType: 'inner' });
    } else {
      setSelectedColumn('');
      setComparisonKey('');
    }

    setCurrentStep(3);
  };

  const handleProcess = async () => {
    if (!selectedOperation || files.length === 0) {
      await showWarning('خطا', 'لطفاً فایل و عملیات را انتخاب کنید');
      return;
    }

    // اعتبارسنجی‌های مختلف
    if (selectedOperation === 'merge' && files.length < 2) {
      await showWarning('خطا', 'برای ادغام حداقل دو فایل نیاز است');
      return;
    }
    if (selectedOperation === 'remove-duplicates' && files.length !== 1) {
      await showWarning('خطا', 'برای حذف تکراری‌ها فقط یک فایل نیاز است');
      return;
    }

    const confirm = await showConfirm('آیا مطمئن هستید؟', 'عملیات پردازش بر روی فایل‌های انتخاب شده انجام خواهد شد.');
    if (!confirm.isConfirmed) return;

    setIsProcessing(true);

    try {
      let response;
      const formData = new FormData();

      switch (selectedOperation) {
        case 'merge':
          files.forEach((file, index) => {
            formData.append(`file${index + 1}`, file);
          });
          response = await axios.post(`${API_ENDPOINTS.MERGE_FILES}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob',
            timeout: 120000,
          });
          break;

        case 'remove-duplicates':
          formData.append('file', files[0]);
          if (selectedColumn) formData.append('column_name', selectedColumn);
          response = await axios.post(`${API_ENDPOINTS.REMOVE_DUPLICATES}`, formData, {
            responseType: 'blob',
            timeout: 60000,
          });
          break;

        case 'convert':
          formData.append('file', files[0]);
          formData.append('target_format', targetFormat);
          response = await axios.post(`${API_ENDPOINTS.CONVERT_FORMAT}`, formData, {
            responseType: 'blob',
            timeout: 60000,
          });
          break;

        case 'compare':
          formData.append('file1', files[0]);
          formData.append('file2', files[1]);
          formData.append('compare_type', comparisonKey ? 'based_on_key' : 'all_columns');
          if (comparisonKey) formData.append('key_column', comparisonKey);
          response = await axios.post(`${API_ENDPOINTS.COMPARE_FILES}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob',
            timeout: 120000,
          });
          break;

        case 'clean-data':
          formData.append('file', files[0]);
          formData.append('operation', cleaningOperation);
          formData.append('column_name', cleaningParams.columnName);
          if (cleaningOperation === 'standardize_phone') {
            formData.append('params', JSON.stringify({ phoneFormat: cleaningParams.phoneFormat }));
          } else {
            formData.append('params', JSON.stringify({}));
          }
          response = await axios.post(`${API_ENDPOINTS.CLEAN_DATA}`, formData, {
            responseType: 'blob',
            timeout: 120000,
          });
          break;

        case 'pivot-table':
          formData.append('file', files[0]);
          formData.append('index_column', pivotParams.indexColumn);
          formData.append('values_column', pivotParams.valuesColumn);
          formData.append('aggregation', pivotParams.aggregation);
          response = await axios.post(`${API_ENDPOINTS.CREATE_PIVOT}`, formData, {
            responseType: 'blob',
            timeout: 120000,
          });
          break;

        case 'join-data':
          formData.append('file1', files[0]);
          formData.append('file2', files[1]);
          formData.append('left_key', joinParams.leftKey);
          formData.append('right_key', joinParams.rightKey);
          formData.append('join_type', joinParams.joinType);
          response = await axios.post(`${API_ENDPOINTS.JOIN_FILES}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob',
            timeout: 120000,
          });
          break;

        default:
          setIsProcessing(false);
          return;
      }

      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let fileName = 'processed_file';
      if (selectedOperation === 'merge') fileName = 'merged_file.xlsx';
      else if (selectedOperation === 'remove-duplicates') fileName = 'deduplicated_file.xlsx';
      else if (selectedOperation === 'convert') fileName = targetFormat === 'excel' ? 'converted_file.xlsx' : 'converted_file.csv';
      else if (selectedOperation === 'compare') fileName = 'comparison_result.xlsx';
      else if (selectedOperation === 'clean-data') fileName = 'cleaned_data.xlsx';
      else if (selectedOperation === 'pivot-table') fileName = 'pivot_table.xlsx';
      else if (selectedOperation === 'join-data') fileName = 'joined_data.xlsx';

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setIsProcessing(false);
      await showSuccess('عملیات موفق', 'عملیات با موفقیت انجام شد! فایل نتیجه دانلود شد.');
    } catch (error) {
      console.error('Error details:', error);
      setIsProcessing(false);

      let errorMessage = 'خطایی در پردازش فایل رخ داد';
      if (error.response) {
        errorMessage = `خطای سرور: ${error.response.data?.detail || error.response.data?.error || 'Server error'}`;
      } else if (error.request) {
        errorMessage = 'اتصال به سرور برقرار نشد.';
      } else {
        errorMessage = error.message || 'خطای ناشناخته';
      }

      await showError('خطا در پردازش', errorMessage);
    }
  };

  const handleNewProcess = async () => {
    const result = await showConfirm('شروع فرآیند جدید', 'آیا مطمئن هستید که می‌خواهید فرآیند جدیدی شروع کنید؟');
    if (!result.isConfirmed) return;

    setFiles([]);
    setSelectedOperation('');
    setSelectedColumn('');
    setAvailableColumns([]);
    setComparisonKey('');
    setCleaningOperation('');
    setCleaningParams({ columnName: '', splitType: 'auto', phoneFormat: 'international' });
    setPivotParams({ indexColumn: '', valuesColumn: '', aggregation: 'sum' });
    setJoinParams({ leftKey: '', rightKey: '', joinType: 'inner' });
    setCurrentStep(1);
    setCurrentWorkflow(null);
    await showSuccess('عملیات موفق', 'فرآیند جدید با موفقیت شروع شد.');
  };

  const hasExcelExtension = (name) => name.toLowerCase().endsWith('.xlsx') || name.toLowerCase().endsWith('.xls');
  const hasPDFExtension = (name) => name.toLowerCase().endsWith('.pdf');

  const getOperationDescription = (op) => ({
    merge: 'ادغام چندین فایل اکسل در یک فایل',
    'remove-duplicates': 'حذف سطرهای تکراری از فایل',
    convert: 'تبدیل فرمت فایل بین CSV و Excel',
    'extract-pdf': 'استخراج جداول از فایل PDF',
    compare: 'مقایسه دو فایل و پیدا کردن تفاوت‌ها',
    'clean-data': 'تمیز کردن و استانداردسازی داده‌ها',
    'pivot-table': 'ایجاد جدول محوری از داده‌ها',
    'join-data': 'ترکیب داده‌ها با JOIN',
  }[op] || '');

  const getColumnLabelForOperation = (op) => ({
    split_name: 'نام کامل',
    standardize_phone: 'شماره تلفن',
    remove_extra_spaces: 'متن',
    standardize_date: 'تاریخ',
  }[op] || 'مورد نظر');

  const getOperationDescriptionDetail = (op) => ({
    split_name: 'جداسازی نام و نام خانوادگی از ستون انتخاب شده',
    standardize_phone: 'استانداردسازی شماره تلفن‌ها به فرمت انتخابی',
    remove_extra_spaces: 'حذف فاصله‌های اضافی از متن',
    standardize_date: 'تبدیل تاریخ‌ها به فرمت استاندارد YYYY-MM-DD',
  }[op] || 'تمیز کردن و استانداردسازی داده‌ها');

  const getJoinTypeDescription = (jt) => ({
    inner: 'فقط سطرهایی که در هر دو فایل وجود دارند',
    left: 'تمام سطرهای فایل اول + سطرهای منطبق از فایل دوم',
    right: 'تمام سطرهای فایل دوم + سطرهای منطبق از فایل اول',
    outer: 'تمام سطرهای هر دو فایل',
  }[jt] || '');

  const isProcessButtonDisabled = () => {
    if (isProcessing) return true;
    if (!selectedOperation || files.length === 0) return true;
    if (selectedOperation === 'clean-data') return !cleaningOperation || !cleaningParams.columnName;
    if (selectedOperation === 'pivot-table') return !pivotParams.indexColumn || !pivotParams.valuesColumn;
    if (selectedOperation === 'join-data') return !joinParams.leftKey || !joinParams.rightKey;
    return false;
  };

  return (
    <>

      <header>
        <div className="container-fluid">
          <div className="container">
            <div className="app-header">
              <a href="/" className='app-logo'>
                <svg width="2449" height="512" viewBox="0 0 2449 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M2.01862 54.6957C5.91414 47.7628 14.2246 48.3575 21.2102 47.2735C37.4584 44.7518 53.5749 41.4095 69.8119 38.7824C127.529 29.452 185.157 19.557 242.886 10.2793C257.681 7.90056 272.627 6.05253 287.283 2.90224C292.628 1.75052 300.649 -1.6858 305.869 1.0053C313.509 4.94222 311.146 13.6704 311.029 20.6297C310.841 31.9173 310.991 43.2237 311.07 54.5112C311.104 59.5397 310.306 65.9004 312.817 70.3455C354.177 68.4974 395.97 69.6755 437.372 69.7244C446.424 69.7357 455.464 69.875 464.505 69.5363C470.459 69.3142 476.082 68.8249 480.079 73.9436C482.579 81.219 480.407 91.3097 480.366 98.9766C480.256 118.029 480.32 137.089 480.302 156.141C480.238 218.872 480.128 281.603 480.211 344.334C480.237 365.042 480.106 385.747 480.027 406.455C480.004 412.579 482.368 424.822 477.347 429.422C474.035 432.455 467.866 431.898 463.741 431.879C453.703 431.834 443.665 431.819 433.627 431.823C392.752 431.846 351.422 429.986 310.608 431.8C310.792 445.29 310.739 458.806 310.83 472.306C310.86 477.263 311.658 484.437 306.569 487.365C301.285 490.402 293.422 487.813 287.878 486.891C272.161 484.275 256.33 482.318 240.658 479.427C183.787 468.945 126.137 461.745 68.9312 453.393C53.4244 451.127 37.9853 448.523 22.4409 446.487C15.0902 445.523 6.36576 445.587 1.91697 438.586C-1.93338 419.768 1.20943 397.422 1.19438 378.212C1.16427 337.439 1.16423 296.666 1.26209 255.892C1.37124 210.731 1.29975 165.565 1.36374 120.404C1.38632 106.707 1.55191 93.0072 1.44276 79.3108C1.37502 71.2563 0.471707 62.6372 2.01862 54.6957ZM33.401 76.0137C32.0988 149.106 33.5403 222.331 33.4161 295.442C33.3709 321.785 33.243 348.124 33.1677 374.467C33.1263 388.107 31.6283 402.774 33.4349 416.279C76.0485 424.649 119.313 429.934 162.183 436.866C187.456 440.954 212.798 444.507 238.117 448.286C250.952 450.201 264.068 453.472 276.933 454.662C275.879 444.432 276.933 433.701 276.944 423.418C276.974 402.097 277.016 380.771 277.016 359.445C277.016 287.309 277.08 215.168 277.031 143.032C277.008 107.596 279.88 70.8611 276.888 35.5719C224.168 41.8198 171.724 51.5266 119.34 60.1381C98.4016 63.5782 77.1889 66.7699 56.4467 71.23C48.7874 72.8785 40.7931 73.3076 33.401 76.0137ZM311.225 105.68C310.167 116.851 310.818 128.357 310.961 139.569C311.01 143.672 309.761 149.859 311.522 153.559C325.896 152.336 340.496 153.811 354.907 153.582C355.216 136.11 353.68 118.085 355.246 100.7C345.039 100.301 334.688 100.764 324.47 100.896C320.563 100.949 314.966 100.012 311.5 101.784C311.436 104.799 311.586 103.504 311.225 105.68ZM310.687 183.594C310.641 201.144 309.358 219.429 311.206 236.882C325.06 235.5 340.187 235.877 354.072 236.803C353.658 219.083 355.257 201.351 354.858 183.632C340.748 181.637 324.944 183.402 310.687 183.594ZM311.123 268.426C310.799 285.216 310.118 302.225 311.424 318.981C319.212 320.453 327.849 319.098 335.768 319.233C341.425 319.335 348.208 320.562 353.737 319.421C352.702 302.62 352.736 284.354 353.774 267.553C339.713 268.629 325.222 268.159 311.123 268.426ZM311.157 354.101C309.904 369.269 309.478 386.499 311.601 401.585C325.617 402.334 339.822 401.724 353.85 401.811C351.723 389.815 353.646 375.381 353.714 363.145C353.74 358.885 354.817 353.07 353.515 349.031C339.717 350.036 325.012 347.71 311.409 350.062C311.353 353.171 311.488 351.831 311.157 354.101ZM386.595 105.68C386.896 121.582 384.886 137.947 386.99 153.732C406.975 153.111 427.831 155.629 447.669 153.661C446.431 136.279 449.25 118.458 447.651 101.16C428.339 102.146 408.289 99.2664 389.116 101.811C386.414 104.479 386.922 103.026 386.595 105.68ZM386.395 188.513C385.496 203.595 384.905 220.678 386.828 235.688C390.652 238.161 398.876 236.607 403.517 236.607C417.951 236.618 432.449 236.242 446.868 236.72C448.418 236.317 447.432 225.756 447.44 223.9C447.489 210.46 447.233 197.001 447.658 183.564C433.574 183.436 419.483 183.571 405.398 183.556C399.738 183.549 391.582 182.028 386.489 184.561C386.617 187.599 386.723 186.285 386.395 188.513ZM386.376 271.32C385.006 286.857 385.68 303.399 386.715 318.94C405.843 322.12 428.049 319.034 447.459 318.827C446.07 302.127 447.342 284.52 447.647 267.756C442.054 265.859 433.909 267.331 427.985 267.338C414.883 267.346 401.785 267.293 388.691 267.462C386.207 269.969 386.764 268.576 386.376 271.32ZM386.192 352.106C385.13 368.004 384.6 385.803 386.888 401.592C407.028 402.379 427.277 400.862 447.414 401.78C446.228 384.396 447.858 366.728 447.271 349.31C441.474 347.936 433.988 349.174 427.985 349.189C414.345 349.223 400.72 349.148 387.103 349.821C386.802 350.585 386.497 351.346 386.192 352.106Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M90.3284 311.181C99.5233 299.167 106.964 285.523 115.068 272.745C120.45 264.258 128.44 255.285 131.865 245.853C132.49 240.158 124.613 231.193 121.639 226.492C111.831 210.978 100.163 195.595 91.4839 179.535C103.054 180.864 115.339 179.795 127.014 180.002C135.49 194.033 143.462 208.614 151.151 223.041C153.978 221.701 155.965 213.849 157.565 211.076C163.466 200.861 168.736 189.52 175.74 180.055C186.711 178.895 198.014 180.198 209.038 179.893C210.152 180.476 207.416 183.265 206.983 183.837C204.375 187.266 202.278 191.116 199.96 194.745C192.398 206.563 185.39 218.75 178.017 230.689C175.277 235.122 169.503 241.302 169.134 246.542C178.469 262.319 188.153 278.108 198.018 293.592C200.935 298.173 203.923 302.742 207.07 307.172C208.127 308.659 210.901 310.71 211.364 312.4C202.813 312.396 194.137 312.306 185.571 311.986C182.285 311.862 178.051 312.426 174.991 311.233C168.762 301.854 163.44 291.82 157.392 282.305C155.227 278.895 153.199 273.366 149.615 271.42C142.878 281.055 136.871 291.285 130.514 301.184C128.471 304.368 126.404 310.119 122.87 311.771C111.944 311.967 100.72 312.927 89.8955 312.795C90.0385 312.257 90.1816 311.719 90.3284 311.181Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M1570.57 220.044C1577.01 219.482 1583.71 220.318 1590.18 220.402C1601.7 220.549 1613.23 220.436 1624.75 220.468C1629.79 220.481 1634.84 220.521 1639.89 220.534C1641.84 220.538 1644.6 220.042 1646.34 220.936C1657.35 241.986 1666.13 264.408 1675.77 286.123C1688.99 315.888 1702.59 345.486 1715.9 375.202C1716.56 375.49 1717.2 373.601 1717.47 373.048C1718.5 370.928 1719.36 368.73 1720.3 366.567C1724.31 357.316 1728.56 348.172 1732.65 338.95C1744.3 312.627 1756.55 286.583 1768.3 260.303C1774.31 246.856 1779.86 232.932 1786.66 219.877C1792.29 218.776 1798.84 219.631 1804.57 219.66C1816.79 219.72 1829.01 220.112 1841.23 220.154C1845.82 220.169 1850.4 220.11 1854.98 220.093C1856.84 220.088 1859.64 219.652 1861.26 220.599C1861.35 223.646 1861.73 227.254 1861.14 230.227C1851.07 230.447 1838.04 230.549 1832.83 240.945C1830.29 246.014 1830.72 252.83 1830.73 258.34C1830.76 267.664 1830.68 276.988 1830.68 286.314C1830.67 314.075 1830.69 341.837 1830.69 369.599C1830.69 377.691 1830.7 385.785 1830.71 393.877C1830.72 399.932 1830.5 406.261 1832.39 412.093C1836.16 423.693 1848.46 424.65 1858.89 424.732C1859.72 427.193 1859.18 430.486 1859.13 433.058C1856.67 433.821 1853.01 433.079 1850.43 433.072C1844.3 433.053 1838.16 433.07 1832.03 433.072C1814.99 433.075 1797.96 433.091 1780.92 433.202C1773.06 433.255 1764.52 432.307 1756.74 433.418C1756.87 430.376 1756.96 427.293 1757 424.249C1767.36 423.604 1779.04 423.995 1784.95 413.708C1788.47 407.59 1788.84 399.707 1788.95 392.822C1789.1 384.132 1789.02 375.442 1789.02 366.75C1789.04 339.713 1789.05 312.672 1789.32 285.635C1789.4 277.34 1789.46 269.021 1789.69 260.731C1789.8 256.86 1790.85 251.806 1790.05 248.049C1789.53 247.842 1788.66 249.964 1788.44 250.43C1787.32 252.798 1786.38 255.239 1785.29 257.621C1780.18 268.764 1774.95 279.848 1769.84 290.991C1754.56 324.303 1740.27 358.043 1725.08 391.389C1720.95 400.46 1716.82 409.532 1712.71 418.614C1710.49 423.539 1708.63 429.04 1705.91 433.689C1702.77 434.052 1698.66 433.562 1695.53 433.151C1683.6 401.802 1668.66 371.308 1654.81 340.76C1650.48 331.212 1645.31 321.661 1641.72 311.82C1636.52 297.597 1629.09 283.954 1623.08 270.043C1621.12 265.51 1619.2 260.973 1617.31 256.419C1616.66 254.876 1616.08 253.286 1615.42 251.758C1615.05 250.909 1614.59 248.488 1614.13 249.296C1613.55 250.324 1614.17 251.656 1614.12 252.837C1614 255.779 1614.15 258.737 1614.11 261.683C1613.97 272.724 1614.1 283.772 1614.15 294.813C1614.27 323.117 1614.34 351.416 1614.39 379.72C1614.41 391.098 1612.18 406.941 1619.23 416.733C1624.65 424.259 1636.38 424.259 1644.73 424.304C1645.61 427.056 1643.99 430.45 1644.82 433.198C1639.6 433.87 1633.69 433.011 1628.41 433.011C1615.21 433.007 1602 433 1588.79 433.193C1582.73 433.282 1576.35 432.733 1570.33 433.562C1570.57 430.643 1570.78 427.221 1570.45 424.31C1580.41 423.572 1591.4 424.028 1596.53 413.555C1599.16 408.196 1599.39 401.471 1599.53 395.61C1599.74 386.627 1599.65 377.634 1599.65 368.649C1599.67 339.626 1599.65 310.601 1599.67 281.578C1599.67 273.534 1599.82 265.491 1599.82 257.448C1599.83 252.111 1600.17 246.474 1598.16 241.424C1593.97 230.873 1580.43 229.978 1570.68 230.18C1569.61 228.868 1569.99 221.662 1570.57 220.044Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M1876.4 395.347C1877.33 391.295 1878.18 387.543 1880.08 383.786C1886.99 370.19 1901.32 363.55 1914.87 358.289C1931.66 351.77 1949.18 347.26 1965.94 340.784C1966.28 335.918 1966.02 330.938 1966.01 326.056C1965.99 317.313 1966.39 308.133 1961.14 300.637C1951.45 286.799 1923.19 288.987 1913.73 302.019C1913.02 302.996 1912.39 304.08 1911.96 305.214C1909.13 312.7 1916.47 314.468 1919.7 319.747C1923.12 325.344 1920.28 333.366 1915.98 337.578C1905.45 347.896 1886.15 341.93 1882.56 327.921C1877.98 310.079 1891.66 296.331 1906.45 289.278C1924.07 280.876 1945.06 279.909 1964.08 283.121C1974.82 284.934 1985.48 288.796 1993.42 296.554C2004.33 307.222 2004.72 322.536 2004.75 336.76C2004.8 352.437 2004.7 368.113 2004.69 383.792C2004.69 391.961 2003.95 400.6 2005.15 408.699C2006.1 415.075 2012.45 420.829 2019.13 417.81C2022.56 416.256 2025.23 412.118 2027.11 409.002C2028.5 409.07 2029.58 410.905 2030.28 412.014C2033.45 417.024 2028.14 421.359 2024.44 424.499C2010.65 436.202 1982.77 442.631 1970.62 425.283C1968.33 422.016 1967.36 417.99 1966.44 414.17C1953.03 427.232 1937.53 435.848 1918.32 436.112C1898.57 436.384 1880.2 427.7 1876.69 406.757C1876.06 402.991 1875.86 399.141 1876.4 395.347ZM1916.01 387.719C1915.39 390.926 1915.35 394.439 1915.95 397.653C1916.68 401.635 1918.07 405.309 1920.55 408.556C1932.26 423.905 1958.55 415.75 1965.85 400.178C1966.92 396.616 1966.27 392.219 1966.28 388.526C1966.31 380.322 1966.31 372.117 1966.29 363.913C1966.28 361.114 1966.31 358.316 1966.26 355.52C1966.25 354.704 1966.74 353.126 1965.54 352.832C1964.52 352.582 1962.28 353.593 1961.31 353.94C1957.74 355.219 1954.16 356.429 1950.65 357.862C1935.98 363.847 1920.02 370.898 1916.01 387.719Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M2038.21 471.964C2039.37 468.983 2040.23 465.998 2042.02 463.282C2047.95 454.308 2057.16 450.07 2066.58 446.093C2061.79 443.093 2056.32 442.705 2051.98 438.469C2039.98 426.765 2042.28 408.236 2053.23 396.752C2056.86 392.936 2061.22 389.577 2065.87 387.095C2067.42 386.266 2072.31 384.716 2073.14 383.328C2070.61 381.256 2067.15 379.952 2064.42 378.036C2059.27 374.424 2054.75 369.425 2051.73 363.891C2035.97 335.025 2050.96 298.537 2080.82 286.735C2093.68 281.655 2108.42 280.297 2122.05 282.614C2127.96 283.619 2133.7 286.347 2139.58 287.034C2142.08 284.509 2143.64 280.631 2145.6 277.663C2150.57 270.103 2156.93 261.961 2165.45 258.312C2176.92 253.4 2194.08 255.774 2196.08 270.551C2196.36 272.62 2196.27 274.782 2195.75 276.807C2193.19 286.826 2181.04 291.359 2172.47 285.44C2167.94 282.306 2165.98 276.506 2165.35 271.269C2158.52 274.965 2152.7 283.436 2149.04 290.117C2151.31 292.745 2155.14 294.575 2157.82 296.926C2163.73 302.116 2168.7 308.531 2171.78 315.792C2180.04 335.235 2175.15 360.927 2158.82 374.697C2149.29 382.73 2138.02 386.626 2126 389.187C2116.98 391.11 2107.49 391.452 2098.33 390.449C2093.87 389.961 2087.28 387.154 2082.94 388.625C2075.82 391.034 2066.67 397.756 2068.03 406.12C2068.95 411.789 2073.63 414 2078.73 414.878C2086.89 416.285 2095.39 416.082 2103.64 416.122C2109.01 416.148 2114.37 416.199 2119.74 416.252C2142.66 416.481 2170.58 414.818 2185.47 435.872C2187.72 439.052 2189.35 442.733 2190.26 446.521C2191.4 451.293 2191.71 456.21 2191.44 461.103C2191.07 467.789 2189.03 474.09 2185.62 479.842C2178.39 492.051 2164.7 500.539 2151.5 504.871C2127.42 512.774 2102.07 513.173 2077.15 509.967C2060.42 507.811 2038.93 500.156 2037.72 480.329C2037.55 477.544 2037.65 474.7 2038.21 471.964ZM2061.04 473.903C2060.54 487.876 2071.99 495.483 2084.07 498.733C2103.31 503.906 2129.05 502.645 2147.24 494.264C2157.02 489.761 2166.21 482.136 2166.31 470.501C2166.44 456.665 2152.26 453.719 2141.24 452.375C2127.16 450.66 2112.76 450.861 2098.6 450.583C2092.44 450.46 2084.84 448.692 2078.89 450.564C2068.71 453.765 2061.42 463.35 2061.04 473.903ZM2084.6 323.403C2083.1 339.437 2083.03 361.394 2094.35 374.237C2102.11 383.044 2118.15 384.186 2126.59 375.564C2133 369.02 2135.59 359.238 2136.45 350.372C2138.03 333.942 2138.04 312.279 2126.91 298.787C2119.04 289.243 2103.25 288.38 2094.62 297.376C2088.07 304.202 2085.46 314.202 2084.6 323.403Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M2208.45 425.042C2215.01 423.274 2222.71 425.566 2227.15 419.047C2232.12 411.756 2230.39 400.418 2230.38 392.112C2230.36 372.993 2230.27 353.873 2230.3 334.755C2230.32 327.125 2232.24 316.398 2228.88 309.331C2225.19 301.564 2217.03 302.393 2210 300.803C2209.84 299.071 2209.73 297.374 2209.69 295.636C2213.22 293.459 2219 293.276 2223.07 292.276C2233.35 289.749 2243.6 286.944 2253.97 284.788C2257.44 284.067 2260.91 283.376 2264.38 282.67C2265.36 282.471 2267.1 281.737 2267.94 282.358C2269.39 317.644 2268.05 353.195 2268.17 388.51C2268.21 398.748 2264.8 418.867 2277.22 423.393C2281.28 424.873 2286.32 424.932 2290.59 424.72C2290.41 427.48 2291.1 430.442 2290.6 433.164C2271.79 433.919 2252.69 433.09 2233.85 432.891C2227.94 432.831 2222.01 432.996 2216.09 433.092C2213.67 433.134 2210.79 433.758 2208.44 433.344C2208.44 430.578 2208.49 427.807 2208.45 425.042Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M2211.8 239.861C2218.73 237.427 2225.9 235.828 2232.58 232.669C2234.92 231.558 2237.85 230.768 2239.69 228.875C2243.05 222.985 2244.75 213.657 2246.08 207C2248.89 207.204 2249.27 210.454 2250.05 212.9C2251.71 218.06 2253.03 225.731 2256.81 229.799C2258.83 231.968 2262.39 232.462 2265.08 233.365C2270.68 235.245 2277.18 236.502 2282.44 239.131C2282.8 241.588 2278.45 241.855 2276.6 242.447C2270.46 244.423 2261.4 245.758 2256.56 250.289C2252.02 254.54 2251.2 264.849 2249.61 270.611C2249.27 271.852 2248.7 276.794 2247.47 277.143C2245.7 276.794 2244.94 271.818 2244.5 270.196C2243.31 265.755 2242.33 261.279 2241.09 256.846C2240.45 254.544 2240.17 251.887 2238.32 250.185C2233.75 245.985 2224.45 244.489 2218.6 242.992C2216.77 242.525 2212.02 241.959 2211.8 239.861Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M2307.03 356.558C2309.28 346.477 2310.35 336.702 2314.62 327.085C2323.05 308.115 2338.66 292.997 2358.23 285.897C2386.74 275.558 2435.45 280.975 2439.04 318.607C2440.21 330.842 2434.98 342.362 2422.95 346.742C2409.18 351.752 2392.88 341.183 2395.35 325.877C2396.37 319.631 2400.66 315.554 2405.94 312.548C2408.19 311.264 2412.59 310.307 2413.8 307.895C2415.02 298.077 2404.63 293.197 2396.49 291.901C2381.42 289.499 2367.32 297.632 2359.28 310.068C2354.59 317.323 2352.09 325.853 2350.62 334.298C2345.88 361.546 2350.23 400.126 2380.62 410.432C2385 411.916 2389.53 412.599 2394.14 412.762C2407.88 413.249 2421.43 407.96 2431.45 398.574C2434.88 395.361 2437.59 389.522 2441.35 387.023C2443.82 388.666 2446.22 390.41 2448.72 391.986C2448.97 393.088 2447.64 394.358 2447.08 395.21C2444.83 398.655 2442.57 402.054 2439.95 405.236C2429.2 418.274 2414.61 428.306 2398.45 433.279C2375.32 440.396 2347.6 434.92 2329.45 418.929C2312.7 404.169 2304.34 378.475 2307.03 356.558Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M608.159 427.287C609.729 417.779 608.518 407.09 608.509 397.459C608.493 380.943 609.013 364.305 608.467 347.807C611.886 347.78 616.486 347.024 619.73 347.978C621.243 377.528 639.238 407.916 668.165 417.43C694.238 426.008 733.667 422.674 741.495 390.859C742.388 387.225 742.614 383.402 742.498 379.673C741.77 356.032 719.736 344.66 700.724 336.306C669.825 322.73 632.629 313.296 617.648 279.639C615.514 274.841 613.846 269.768 612.969 264.583C611.943 258.506 611.403 252.33 612.063 246.178C612.916 238.224 614.712 230.392 618.283 223.178C634.67 190.047 673.705 182.177 707.198 187.682C715.864 189.107 724.389 192.06 732.301 195.859C737.088 198.157 743.797 201.78 749.277 200.288C754.442 198.879 756.832 192.413 757.886 187.78C760.635 187.509 763.746 188.049 766.497 188.32C768.106 213.794 766.742 239.794 766.931 265.321C764.079 265.148 761.177 265.25 758.321 265.299C757.509 265.313 756.214 265.757 755.745 265.084C753.845 236.842 733.108 208.703 705.738 201.036C682.018 194.391 650.193 201.307 646.333 229.789C642.331 259.324 672.029 272.372 695.037 280.789C724.677 291.633 760.99 304.02 774.331 335.519C776.81 341.371 778.297 347.546 779.143 353.83C780.073 360.736 780.004 368.009 778.904 374.893C777.538 383.461 774.168 391.552 769.747 398.983C750.76 430.902 708.44 437.4 674.604 433.265C664.097 431.98 653.786 429.165 643.764 425.853C638.856 424.23 631.459 421.312 626.353 423.49C621.206 425.686 620.886 430.539 617.922 434.346C614.58 434.036 611.346 434.054 608.008 434.064C607.979 431.799 608.028 429.55 608.159 427.287Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M803.465 193.411C818.321 190.099 833.353 187.416 848.236 184.154C854.514 182.777 861.284 181.966 867.388 180C868.008 182.539 867.325 185.821 867.297 188.456C867.227 194.916 867.321 201.384 867.333 207.843C867.374 228.574 867.449 249.307 867.566 270.038C867.606 277.175 867.662 284.312 867.541 291.448C867.503 293.748 868.424 298.202 867.017 299.929C866.824 300.379 869.128 297.875 869.527 297.211C870.791 295.11 872.474 293.253 874.144 291.475C879.637 285.625 885.774 280.413 892.721 276.372C912.245 265.01 943.077 261.003 961.261 277.128C974.376 288.763 975.956 307.151 975.974 323.521C975.997 343.069 975.976 362.617 975.991 382.166C975.997 392.683 973.358 407.817 980.057 416.764C983.019 420.722 988.374 422.051 993.07 422.319C994.882 422.423 997.869 421.839 999.482 422.708C999.437 424.774 999.091 427.019 999.268 429.068C999.313 429.598 999.915 431.044 999.437 431.478C970.163 431.345 940.956 430.766 911.682 431.553C911.831 428.693 911.963 425.763 911.965 422.9C919.449 420.824 927.272 423.081 931.958 415.049C937.176 406.104 934.878 392.065 934.878 382.17C934.878 375.374 934.845 368.577 934.833 361.781C934.823 356.682 934.823 351.584 934.827 346.486C934.845 328.924 939.631 300.969 918.98 292.706C916.358 291.658 913.389 291.032 910.587 290.743C896.09 289.246 883.919 295.604 874.888 306.619C872.372 309.69 868.832 314.159 867.949 318.095C866.697 323.669 867.778 330.592 867.776 336.301C867.774 349.102 867.845 361.902 867.851 374.703C867.855 382.461 867.796 390.222 867.841 397.983C867.878 404.206 867.927 410.625 871.617 415.924C874.6 420.206 879.99 421.986 884.989 422.374C887.275 422.551 890.256 421.986 892.411 422.788C892.33 424.729 892.817 430.22 891.655 431.678C872.266 431.451 852.879 431.362 833.488 431.38C823.719 431.388 812.808 430.226 803.173 431.855C802.935 429.092 802.507 425.092 803.31 422.453C808.634 422.176 814.804 422.796 819.653 420.12C824.151 417.639 826.324 412.415 826.944 407.533C828.237 397.359 827.426 386.499 827.289 376.263C826.704 332.735 827.517 289.095 827.646 245.555C827.668 237.648 827.64 229.743 827.627 221.835C827.619 217.2 827.466 211.836 824.444 208.021C821.315 204.067 816.405 202.564 811.607 201.814C808.862 201.384 805.898 200.988 803.126 201.29C803.294 198.843 803.394 196.302 803.102 193.868C803.222 193.715 803.345 193.562 803.465 193.411Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M1019.9 345.694C1022.26 333.57 1024.01 322.027 1029.97 310.918C1047.43 278.414 1081.87 262.287 1117.99 268.475C1147.69 273.565 1167.55 297.348 1167.79 327.365C1167.84 333.6 1168.75 342.505 1165.3 347.959C1155.51 349.085 1145.13 348.247 1135.27 348.231C1110.81 348.192 1086.2 347.113 1061.77 348.643C1061.31 354.017 1062.54 360.551 1063.72 365.803C1066.22 376.916 1070.96 387.56 1078.99 395.824C1092.95 410.189 1116.06 414.455 1134.76 407.995C1143.09 405.118 1150.59 400.767 1157 394.709C1159.59 392.268 1163.62 385.356 1166.97 384.622C1168.69 386.359 1173.33 388.842 1173.97 391.12C1171.04 396.579 1166.36 401.591 1162.13 406.078C1134.13 435.771 1081.42 444.327 1047.97 418.325C1026.02 401.258 1017.04 372.738 1019.9 345.694ZM1062.8 329.365C1062.57 331.268 1061.48 334.793 1062.52 336.414C1075.44 337.214 1088.65 336.659 1101.6 336.675C1107.14 336.684 1114.72 337.923 1119.9 335.611C1128.8 331.645 1130.39 317.292 1130.52 309.016C1130.63 301.284 1129.43 293.019 1124.34 286.855C1114.61 275.066 1094.27 275.991 1083.1 284.967C1077.78 289.239 1073.61 294.783 1070.55 300.851C1065.98 309.929 1064.61 319.523 1062.8 329.365Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M1197.26 346.708C1199.46 336.594 1200.28 326.705 1204.44 316.997C1216.05 289.888 1239.71 271.143 1269.26 267.782C1298.47 264.461 1330.43 274.432 1341.36 304.22C1343.66 310.5 1345.14 317.378 1345.57 324.062C1346.04 331.36 1346.52 340.597 1343.43 347.413C1341.84 348.555 1338.04 347.939 1336.09 347.97C1329.3 348.07 1322.5 348.049 1315.71 348.033C1290.21 347.97 1264.68 347.705 1239.2 348.61C1238.03 355.292 1240.46 364.971 1242.38 371.356C1245.49 381.724 1250.97 391.65 1259.22 398.799C1285.22 421.314 1326.34 411.386 1344.31 383.837C1347.17 385.123 1350.5 388.235 1352.33 390.737C1351.48 393.32 1348.88 395.382 1347.23 397.465C1343.06 402.72 1338.84 407.757 1333.66 412.075C1308.09 433.402 1270.66 440.245 1239.72 426.31C1209.16 412.55 1194.08 379.163 1197.26 346.708ZM1240.15 331.413C1239.94 333.121 1239.9 334.822 1239.85 336.541C1253.21 336.769 1266.64 336.49 1280.02 336.455C1285.23 336.441 1293.02 337.736 1297.9 335.572C1307.03 331.525 1308.52 316.134 1308.52 307.701C1308.52 300.391 1307 292.243 1302.05 286.572C1291.63 274.66 1270.93 276.575 1259.68 285.922C1254.48 290.234 1250.36 295.589 1247.45 301.677C1242.9 311.206 1241.73 321.136 1240.15 331.413Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M1370.57 271.837C1372.63 270.165 1376.24 270.179 1378.78 269.551C1382.36 268.668 1386.03 266.957 1389.31 265.291C1405.97 256.813 1418.84 240.29 1422.56 221.823C1425.98 221.576 1429.47 221.945 1432.89 221.986C1432.25 234.183 1432.77 246.575 1432.73 258.801C1432.73 261.76 1432.75 264.716 1432.76 267.673C1432.77 268.395 1432.47 270.144 1432.99 270.67C1443.85 270.46 1454.73 270.642 1465.59 270.658C1469.04 270.664 1475.63 269.304 1478.68 270.782C1478.56 274.585 1479.16 278.79 1478.52 282.537C1463.19 282.59 1447.81 283.139 1432.49 282.89C1430.81 306.219 1432.35 330.225 1432.34 353.621C1432.34 367.723 1430.28 383.801 1433.54 397.611C1439.02 420.863 1469.51 412.772 1479.96 398.099C1481.73 397.728 1484.86 401.029 1486.66 401.869C1487.34 402.984 1483.95 406.455 1483.23 407.466C1478.98 413.461 1473.65 418.628 1467.64 422.837C1450.5 434.847 1418.84 439.304 1402.9 422.667C1391.47 410.729 1391.92 392.302 1391.89 376.85C1391.83 345.783 1393.13 314.457 1391.85 283.422C1391.05 282.415 1388.02 282.937 1386.77 282.929C1381.81 282.894 1375.05 283.9 1370.34 282.421C1370.74 278.971 1370.66 275.313 1370.57 271.837Z" />
                </svg>

              </a>
              <div className="workflow-controls">
                <button
                  className="btn-workflow"
                  onClick={() => setShowSaveModal(true)}
                  disabled={!selectedOperation || files.length === 0}
                >
                  <img src={getImagePath("save.png")} alt="ذخیره" />
                </button>

                <button
                  className="btn-workflow"
                  onClick={() => setShowLoadModal(true)}
                  disabled={workflows.length === 0}
                >
                  <img src={getImagePath("load.png")} alt="بارگذاری" />
                </button>
                {/* دکمه تغییر تم */}
                <div className="theme-toggler">
                  <button
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title={currentTheme === 'light' ? 'فعال کردن تم دارک' : 'فعال کردن تم لایت'}
                  >
                    {currentTheme === 'light' ? (
                      <img src={getImagePath("moon.png")} alt="تم تاریک" />
                    ) : (
                      <img src={getImagePath("contrast.png")} alt="تم روشن" />
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>
      <div className="container-fluid">
        <div className="container">
          <div className="steps-container">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">آپلود فایل</div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">انتخاب عملیات</div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">پردازش و نتیجه</div>
            </div>
          </div>
          <div className="content-area">
            {currentStep === 1 && (
              <div className="step-content active">
                <h2>فایل‌های خود را آپلود کنید</h2>
                {currentWorkflow && (
                  <div style={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    border: '2px solid #8951FF'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <i className="fas fa-project-diagram" style={{ fontSize: '2rem' }}></i>
                      <div>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
                          پروژه بارگذاری شده: "{currentWorkflow.name}"
                        </h4>
                        <p style={{ margin: '5px 0', opacity: 0.9 }}>
                          <strong>عملیات:</strong> {getOperationDescription(currentWorkflow.steps.selectedOperation)}
                        </p>
                        <p style={{ margin: '5px 0', opacity: 0.9 }}>
                          <strong>فایل‌های اصلی:</strong> {currentWorkflow.steps.files.map(f => f.name).join(', ')}
                        </p>
                        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                          💡 فایل‌های جدید را در این مرحله انتخاب کنید تا با تنظیمات پروژه پردازش شوند.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div {...getRootProps()} className={`upload-area ${isDragActive ? 'drag-active' : ''}`}>
                  <input {...getInputProps()} />
                  <div className="upload-icon">
                    <img src={getImagePath("upload.gif")} alt="آپلود" />
                  </div>
                  <p>فایل‌ها را اینجا رها کنید یا برای انتخاب کلیک کنید</p>
                  <small>فرمت‌های پشتیبانی شده: Excel (.xlsx, .xls), CSV (.csv)</small>
                  <button className="browse-btn">انتخاب فایل</button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-content active">
                <h2>عملیات مورد نظر را انتخاب کنید</h2>

                <div className="files-preview">
                  <h3>فایل‌های انتخاب شده:</h3>
                  <ul>
                    {files.map((file, idx) => (
                      <li key={idx}>
                        <i className="fas fa-file" />
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>

                  {/* نمایش اطلاعات پروژه بارگذاری شده */}
                  {currentWorkflow && (
                    <div style={{
                      background: '#e8f5e8',
                      border: '1px solid #4CAF50',
                      borderRadius: '8px',
                      padding: '15px',
                      marginTop: '15px'
                    }}>
                      <h4 style={{ color: '#2e7d32', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-project-diagram"></i>
                        اطلاعات پروژه بارگذاری شده
                      </h4>
                      <p style={{ margin: '5px 0', color: '#333' }}>
                        <strong>نام پروژه:</strong> {currentWorkflow.name}
                      </p>
                      <p style={{ margin: '5px 0', color: '#333' }}>
                        <strong>عملیات:</strong> {getOperationDescription(currentWorkflow.steps.selectedOperation)}
                      </p>
                      <p style={{ margin: '5px 0', color: '#333' }}>
                        <strong>فایل‌های اصلی پروژه:</strong> {currentWorkflow.steps.files.map(f => f.name).join(', ')}
                      </p>
                      {files.length === 0 && (
                        <div style={{
                          background: '#fff3cd',
                          border: '1px solid #ffeaa7',
                          borderRadius: '5px',
                          padding: '10px',
                          marginTop: '10px',
                          color: '#856404'
                        }}>
                          <i className="fas fa-info-circle"></i>
                          <strong> توجه: </strong>
                          شما فایل‌های جدید انتخاب نکرده‌اید. برای اجرای عملیات، لطفاً به مرحله ۱ برگردید و فایل‌های جدید را انتخاب کنید.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="operations-grid">
                  {files.length >= 2 && (
                    <div className={`operation-card ${selectedOperation === 'merge' ? 'selected' : ''}`}>
                      <div className="operation-header">
                        <div className="operation-content" onClick={() => handleOperationSelect('merge')}>
                          <div className="operation-icon">
                            <img src={getImagePath("merge.gif")} alt="ادغام" />
                          </div>
                          <h3>ادغام فایل‌ها</h3>
                          <p>ادغام چندین فایل اکسل در یک فایل واحد</p>
                        </div>
                        <button
                          className="help-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            showHelp('merge');
                          }}
                          title="راهنما"
                        >
                          <img src={getImagePath("question.gif")} alt="راهنما" />
                        </button>
                      </div>
                    </div>
                  )}

                  {files.length === 1 && (hasExcelExtension(files[0].name) || files[0].name.toLowerCase().endsWith('.csv')) && (
                    <div className={`operation-card ${selectedOperation === 'remove-duplicates' ? 'selected' : ''}`}>
                      <div className="operation-header">
                        <div className="operation-content" onClick={() => handleOperationSelect('remove-duplicates')}>
                          <div className="operation-icon">
                            <img src={getImagePath("file.gif")} alt="حذف تکراری‌ها" />
                          </div>
                          <h3>حذف تکراری‌ها</h3>
                          <p>حذف سطرهای تکراری بر اساس ستون مشخص یا تمام داده‌ها</p>
                        </div>
                        <button
                          className="help-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            showHelp('remove-duplicates');
                          }}
                          title="راهنما"
                        >
                          <img src={getImagePath("question.gif")} alt="راهنما" />

                        </button>
                      </div>
                    </div>
                  )}

                  {files.length === 1 && (hasExcelExtension(files[0].name) || files[0].name.toLowerCase().endsWith('.csv')) && (
                    <div className={`operation-card ${selectedOperation === 'convert' ? 'selected' : ''}`}>
                      <div className="operation-header">
                        <div className="operation-content" onClick={() => handleOperationSelect('convert')}>
                          <div className="operation-icon">
                            <img src={getImagePath("convert.gif")} alt="تبدیل فرمت" />
                          </div>
                          <h3>تبدیل فرمت</h3>
                          <p>تبدیل بین فرمت‌های CSV و Excel</p>
                        </div>
                        <button
                          className="help-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            showHelp('convert');
                          }}
                          title="راهنما"
                        >
                          <img src={getImagePath("question.gif")} alt="راهنما" />
                        </button>
                      </div>
                    </div>
                  )}



                  {files.length === 2 && (
                    <div className={`operation-card ${selectedOperation === 'compare' ? 'selected' : ''}`}>
                      <div className="operation-header">
                        <div className="operation-content" onClick={() => handleOperationSelect('compare')}>
                          <div className="operation-icon">
                            <img src={getImagePath("ab-testing.gif")} alt="مقایسه" />
                          </div>
                          <h3>مقایسه فایل‌ها</h3>
                          <p>پیدا کردن تفاوت‌ها بین دو فایل اکسل</p>
                        </div>
                        <button
                          className="help-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            showHelp('compare');
                          }}
                          title="راهنما"
                        >
                          <img src={getImagePath("question.gif")} alt="راهنما" />
                        </button>
                      </div>
                    </div>
                  )}

                  {files.length === 1 && (hasExcelExtension(files[0].name) || files[0].name.toLowerCase().endsWith('.csv')) && (
                    <div className={`operation-card ${selectedOperation === 'clean-data' ? 'selected' : ''}`}>
                      <div className="operation-header">
                        <div className="operation-content" onClick={() => handleOperationSelect('clean-data')}>
                          <div className="operation-icon">
                            <img src={getImagePath("clean-up.gif")} alt="تمیز کردن داده" />
                          </div>
                          <h3>تمیز کردن داده</h3>
                          <p>استانداردسازی و تمیز کردن داده‌ها</p>
                        </div>
                        <button
                          className="help-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            showHelp('clean-data');
                          }}
                          title="راهنما"
                        >
                          <img src={getImagePath("question.gif")} alt="راهنما" />
                        </button>
                      </div>
                    </div>
                  )}

                  {files.length === 1 && (hasExcelExtension(files[0].name) || files[0].name.toLowerCase().endsWith('.csv')) && (
                    <div className={`operation-card ${selectedOperation === 'pivot-table' ? 'selected' : ''}`}>
                      <div className="operation-header">
                        <div className="operation-content" onClick={() => handleOperationSelect('pivot-table')}>
                          <div className="operation-icon">
                            <img src={getImagePath("table.gif")} alt="جدول محوری" />
                          </div>
                          <h3>جدول محوری</h3>
                          <p>ایجاد جدول محوری برای تجزیه و تحلیل داده‌ها</p>
                        </div>
                        <button
                          className="help-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            showHelp('pivot-table');
                          }}
                          title="راهنما"
                        >
                          <img src={getImagePath("question.gif")} alt="راهنما" />
                        </button>
                      </div>
                    </div>
                  )}

                  {files.length === 2 && (
                    <div className={`operation-card ${selectedOperation === 'join-data' ? 'selected' : ''}`}>
                      <div className="operation-header">
                        <div className="operation-content" onClick={() => handleOperationSelect('join-data')}>
                          <div className="operation-icon">
                            <img src={getImagePath("broken-link.gif")} alt="ترکیب داده" />
                          </div>
                          <h3>ترکیب داده‌ها</h3>
                          <p>JOIN کردن جداول بر اساس کلید مشترک</p>
                        </div>
                        <button
                          className="help-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            showHelp('join-data');
                          }}
                          title="راهنما"
                        >
                          <img src={getImagePath("question.gif")} alt="راهنما" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="navigation-buttons">
                  <button className="btn-secondary returnBtns" onClick={() => setCurrentStep(1)}>
                    <i className="fas fa-arrow-right" /> بازگشت
                  </button>
                  <button className="btn-secondary startAgainBtn" onClick={handleNewProcess}>
                    <i className="fas fa-undo" /> شروع جدید
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-content active">
                <h2>تنظیمات عملیات</h2>

                <div className="operation-info">
                  <h3>{getOperationDescription(selectedOperation)}</h3>
                  {selectedOperation === 'clean-data' && cleaningOperation && (
                    <p className="operation-detail">
                      {getOperationDescriptionDetail(cleaningOperation)}
                    </p>
                  )}
                  {selectedOperation === 'pivot-table' && (
                    <p className="operation-detail">
                      ایجاد جدول محوری برای خلاصه‌سازی و تجزیه و تحلیل داده‌ها
                    </p>
                  )}
                  {selectedOperation === 'join-data' && (
                    <p className="operation-detail">
                      ترکیب دو فایل بر اساس ستون کلید مشترک
                    </p>
                  )}
                </div>

                <div className="settings-panel">
                  {/* حذف تکراری‌ها */}
                  {selectedOperation === 'remove-duplicates' && availableColumns.length > 0 && (
                    <div className="setting-group">
                      <label>ستون برای حذف تکراری‌ها (اختیاری):</label>
                      <select ref={selectColumnRef} value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)}>
                        <option value="">حذف تکراری‌ها بر اساس تمام ستون‌ها</option>
                        {availableColumns.map((col, i) => (
                          <option key={i} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* تبدیل فرمت */}
                  {selectedOperation === 'convert' && (
                    <div className="setting-group">
                      <label>فرمت هدف:</label>
                      <select ref={targetFormatRef} value={targetFormat} onChange={(e) => setTargetFormat(e.target.value)}>
                        {files[0]?.name.toLowerCase().endsWith('.csv')
                          ? <option value="excel">تبدیل به Excel (.xlsx)</option>
                          : <option value="csv">تبدیل به CSV (.csv)</option>}
                      </select>
                    </div>
                  )}

                  {/* مقایسه */}
                  {selectedOperation === 'compare' && availableColumns.length > 0 && (
                    <div className="setting-group">
                      <label>ستون کلید برای مقایسه (اختیاری):</label>
                      <select ref={comparisonKeyRef} value={comparisonKey} onChange={(e) => setComparisonKey(e.target.value)}>
                        <option value="">مقایسه بر اساس تمام ستون‌ها</option>
                        {availableColumns.map((col, i) => (
                          <option key={i} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* تمیز کردن داده‌ها */}
                  {selectedOperation === 'clean-data' && (
                    <div className="clean-data-settings">
                      <div className="setting-group">
                        <label>عملیات تمیز کردن:</label>
                        <select
                          ref={cleaningOperationRef}
                          value={cleaningOperation}
                          onChange={(e) => {
                            setCleaningOperation(e.target.value);
                            setCleaningParams({
                              columnName: '',
                              phoneFormat: 'international'
                            });
                          }}
                        >
                          <option value="">-- انتخاب عملیات تمیز کردن --</option>
                          <option value="split_name">جدا کردن نام و نام خانوادگی</option>
                          <option value="standardize_phone">استانداردسازی شماره تلفن</option>
                          <option value="remove_extra_spaces">حذف فاصله‌های اضافی</option>
                          <option value="standardize_date">استانداردسازی تاریخ</option>
                        </select>
                      </div>

                      {cleaningOperation && (
                        <div className="setting-group">
                          <label>ستون {getColumnLabelForOperation(cleaningOperation)}:</label>
                          <select
                            ref={cleaningColumnRef}
                            value={cleaningParams.columnName}
                            onChange={(e) =>
                              setCleaningParams((p) => ({ ...p, columnName: e.target.value }))
                            }
                          >
                            <option value="">-- انتخاب ستون --</option>
                            {availableColumns.map((col, i) => (
                              <option key={i} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {cleaningOperation && cleaningParams.columnName && (
                        <div className="operation-specific-settings">
                          {cleaningOperation === 'split_name' && (
                            <div className="setting-group">
                              <p className="info-text">
                                نام و نام خانوادگی با استفاده از <strong>فاصله</strong> از هم جدا خواهند شد.
                                ستون‌های جدید با نام‌های <strong>first_name</strong> و <strong>last_name</strong> ایجاد می‌شوند.
                              </p>
                            </div>
                          )}

                          {cleaningOperation === 'standardize_phone' && (
                            <div className="setting-group">
                              <label>فرمت شماره تلفن:</label>
                              <select
                                ref={phoneFormatRef}
                                value={cleaningParams.phoneFormat}
                                onChange={(e) =>
                                  setCleaningParams((p) => ({ ...p, phoneFormat: e.target.value }))
                                }
                              >
                                <option value="international">بین‌المللی (+98...)</option>
                                <option value="local">محلی (09...)</option>
                                <option value="simple">ساده (بدون کد کشور)</option>
                              </select>
                            </div>
                          )}

                          {(cleaningOperation === 'remove_extra_spaces' || cleaningOperation === 'standardize_date') && (
                            <div className="setting-group">
                              <p className="info-text">
                                {cleaningOperation === 'remove_extra_spaces'
                                  ? 'فاصله‌های اضافی از متن ستون انتخاب شده حذف خواهند شد.'
                                  : 'تاریخ‌های ستون انتخاب شده به فرمت استاندارد YYYY-MM-DD تبدیل خواهند شد.'
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* جدول محوری */}
                  {selectedOperation === 'pivot-table' && availableColumns.length > 0 && (
                    <div className="pivot-settings">
                      <div className="setting-group">
                        <label>ستون ایندکس (گروه‌بندی):</label>
                        <select ref={pivotIndexRef} value={pivotParams.indexColumn} onChange={(e) => setPivotParams((p) => ({ ...p, indexColumn: e.target.value }))}>
                          <option value="">-- انتخاب ستون ایندکس --</option>
                          {availableColumns.map((col, i) => (
                            <option key={i} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      <div className="setting-group">
                        <label>ستون مقادیر (محاسبات):</label>
                        <select ref={pivotValuesRef} value={pivotParams.valuesColumn} onChange={(e) => setPivotParams((p) => ({ ...p, valuesColumn: e.target.value }))}>
                          <option value="">-- انتخاب ستون مقادیر --</option>
                          {availableColumns.map((col, i) => (
                            <option key={i} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>

                      <div className="setting-group">
                        <label>نوع محاسبه:</label>
                        <select ref={pivotAggregationRef} value={pivotParams.aggregation} onChange={(e) => setPivotParams((p) => ({ ...p, aggregation: e.target.value }))}>
                          <option value="sum">جمع</option>
                          <option value="mean">میانگین</option>
                          <option value="count">تعداد</option>
                          <option value="min">حداقل</option>
                          <option value="max">حداکثر</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* ترکیب داده‌ها */}
                  {selectedOperation === 'join-data' && availableColumns.length > 0 && (
                    <div className="join-settings">
                      <div className="files-columns-container">
                        <div className="file-columns">
                          <h4>فایل اول: {files[0]?.name}</h4>
                          <div className="setting-group">
                            <label>ستون کلید فایل اول:</label>
                            <select
                              ref={joinLeftKeyRef}
                              value={joinParams.leftKey}
                              onChange={(e) => setJoinParams((p) => ({ ...p, leftKey: e.target.value }))}
                            >
                              <option value="">-- انتخاب ستون کلید --</option>
                              {availableColumns.map((col, i) => (
                                <option key={i} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="file-columns">
                          <h4>فایل دوم: {files[1]?.name}</h4>
                          <div className="setting-group">
                            <label>ستون کلید فایل دوم:</label>
                            <select
                              ref={joinRightKeyRef}
                              value={joinParams.rightKey}
                              onChange={(e) => setJoinParams((p) => ({ ...p, rightKey: e.target.value }))}
                            >
                              <option value="">-- انتخاب ستون کلید --</option>
                              {availableColumns.map((col, i) => (
                                <option key={i} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="setting-group">
                        <label>نوع JOIN:</label>
                        <select
                          ref={joinTypeRef}
                          value={joinParams.joinType}
                          onChange={(e) => setJoinParams((p) => ({ ...p, joinType: e.target.value }))}
                        >
                          <option value="inner">INNER JOIN (فقط سطرهای منطبق در هر دو فایل)</option>
                          <option value="left">LEFT JOIN (تمام سطرهای فایل اول + سطرهای منطبق از فایل دوم)</option>
                          <option value="right">RIGHT JOIN (تمام سطرهای فایل دوم + سطرهای منطبق از فایل اول)</option>
                          <option value="outer">FULL OUTER JOIN (تمام سطرهای هر دو فایل)</option>
                        </select>
                      </div>

                      <div className="join-preview">
                        <h4>پیش‌نمایش عملیات:</h4>
                        <p>فایل اول: <strong>{files[0]?.name}</strong> → ستون کلید: <strong>{joinParams.leftKey || '---'}</strong></p>
                        <p>فایل دوم: <strong>{files[1]?.name}</strong> → ستون کلید: <strong>{joinParams.rightKey || '---'}</strong></p>
                        <p>نوع JOIN: <strong>{getJoinTypeDescription(joinParams.joinType)}</strong></p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="navigation-buttons">
                  <button className="btn-secondary returnBtns" onClick={() => setCurrentStep(2)}>
                    <i className="fas fa-arrow-right" /> بازگشت
                  </button>
                  <button className="btn-primary" onClick={handleProcess} disabled={isProcessButtonDisabled()}>
                    {isProcessing ? (
                      <>
                        <i className="fas fa-spinner fa-spin" /> در حال پردازش...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-cogs" /> اجرای عملیات
                      </>
                    )}
                  </button>
                  <button className="btn-secondary startAgainBtn" onClick={handleNewProcess}>
                    <i className="fas fa-undo" /> شروع جدید
                  </button>
                </div>
              </div>
            )}
          </div>
          <footer className="app-footer">
            <p>© 2025 Sheet Magic - تمام حقوق محفوظ است</p>
          </footer>
        </div>
      </div>


      {showSaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={() => setShowSaveModal(false)}>

          <div style={{
            background: 'white',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>

            {/* هدر مودال */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '25px',
              borderBottom: '1px solid #e9ecef',
              background: '#f8f9fa',
              borderRadius: '15px 15px 0 0'
            }}>
              <h3 style={{ margin: 0, color: '#495057', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-save"></i> ذخیره پروژه
              </h3>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '8px',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.color = '#dc3545';
                  e.target.style.background = '#f8f9fa';
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#6c757d';
                  e.target.style.background = 'none';
                }}
                onClick={() => setShowSaveModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* محتوای مودال */}
            <div style={{ padding: '25px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#333'
                }}>نام پروژه:</label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="مثلاً: تحلیل فروش فصلی"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = 'none';
                  }}
                  autoFocus
                />
              </div>

              <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                borderRight: '4px solid #667eea',
                marginTop: '20px'
              }}>
                <h4 style={{ marginBottom: '15px', color: '#495057' }}>خلاصه عملیات:</h4>
                <p style={{ marginBottom: '8px', color: '#6c757d' }}>
                  <strong>فایل‌ها:</strong> {files.map(f => f.name).join(', ')}
                </p>
                <p style={{ marginBottom: '8px', color: '#6c757d' }}>
                  <strong>عملیات:</strong> {getOperationDescription(selectedOperation)}
                </p>
                {selectedOperation === 'clean-data' && cleaningOperation && (
                  <p style={{ marginBottom: '8px', color: '#6c757d' }}>
                    <strong>جزئیات:</strong> {getOperationDescriptionDetail(cleaningOperation)}
                  </p>
                )}
              </div>
            </div>

            {/* فوتر مودال */}
            <div style={{
              padding: '20px 25px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px',
              background: 'white',
              borderRadius: '0 0 15px 15px'
            }}>
              <button
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#5a6268'}
                onMouseOut={(e) => e.target.style.background = '#6c757d'}
                onClick={() => setShowSaveModal(false)}
              >
                انصراف
              </button>
              <button
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => e.target.style.background = '#5a6fd8'}
                onMouseOut={(e) => e.target.style.background = '#667eea'}
                onClick={saveWorkflow}
              >
                <i className="fas fa-save"></i> ذخیره پروژه
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={() => setShowLoadModal(false)}>

          <div style={{
            background: 'white',
            borderRadius: '15px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>

            {/* هدر مودال */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '25px',
              borderBottom: '1px solid #e9ecef',
              background: '#f8f9fa',
              borderRadius: '15px 15px 0 0'
            }}>
              <h3 style={{ margin: 0, color: '#495057', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-folder-open"></i> پروژه‌های ذخیره شده
              </h3>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '8px',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.color = '#dc3545';
                  e.target.style.background = '#f8f9fa';
                }}
                onMouseOut={(e) => {
                  e.target.style.color = '#6c757d';
                  e.target.style.background = 'none';
                }}
                onClick={() => setShowLoadModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* محتوای مودال */}
            <div style={{ padding: '25px' }}>
              {workflows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6c757d' }}>
                  <i className="fas fa-folder-open" style={{ fontSize: '3rem', marginBottom: '15px', opacity: '0.5' }}></i>
                  <p style={{ fontSize: '1.1rem' }}>هیچ پروژه‌ای ذخیره نشده است</p>
                  <small>پس از تنظیم یک عملیات می‌توانید آن را ذخیره کنید</small>
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {workflows.map(workflow => (
                    <div key={workflow.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '20px',
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      marginBottom: '15px',
                      transition: 'all 0.3s ease',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                      onMouseOver={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.borderColor = '#e9ecef';
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translateY(0)';
                      }}
                      onClick={() => loadWorkflow(workflow)}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '5px', color: '#495057', fontSize: '1.1rem' }}>
                          {workflow.name}
                        </h4>
                        <p style={{ marginBottom: '10px', color: '#6c757d', fontSize: '0.9rem' }}>
                          ذخیره شده در: {workflow.timestamp}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{
                            background: '#667eea',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem'
                          }}>
                            {getOperationDescription(workflow.steps.selectedOperation)}
                          </span>
                          <span style={{
                            background: '#28a745',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem'
                          }}>
                            {workflow.steps.files.length} فایل
                          </span>
                        </div>
                      </div>
                      <button
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = '#c82333';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = '#dc3545';
                          e.target.style.transform = 'scale(1)';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkflow(workflow.id);
                        }}
                        title="حذف پروژه"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* فوتر مودال */}
            <div style={{
              padding: '20px 25px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              background: 'white',
              borderRadius: '0 0 15px 15px'
            }}>
              <button
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#5a6268'}
                onMouseOut={(e) => e.target.style.background = '#6c757d'}
                onClick={() => setShowLoadModal(false)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
      {/* مودال راهنما */}
      {helpModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }} onClick={closeHelp}>

          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>

            {/* هدر مودال */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '25px 30px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px 20px 0 0',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{
                margin: 0,
                color: 'white',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: '600'
              }}>
                <i className="fas fa-info-circle"></i>
                {helpModal.title}
              </h3>
              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'rotate(0deg)';
                }}
                onClick={closeHelp}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* محتوای مودال */}
            <div style={{
              padding: '30px',
              background: 'white',
              borderRadius: '0 0 20px 20px'
            }}>

              {/* بخش توضیحات اصلی */}
              <div style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                boxShadow: '0 8px 25px rgba(245, 87, 108, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '15px'
                }}>
                  <i className="fas fa-lightbulb" style={{ fontSize: '1.5rem', marginTop: '2px' }}></i>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>
                      این عملیات چه کاری انجام می‌دهد؟
                    </h4>
                    <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem' }}>
                      {helpModal.content}
                    </p>
                  </div>
                </div>
              </div>

              {/* بخش مثال‌ها */}
              <div style={{
                background: '#fff9e6',
                border: '2px solid #ffd166',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '25px'
              }}>
                <h4 style={{
                  margin: '0 0 15px 0',
                  color: '#856404',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.1rem'
                }}>
                  <i className="fas fa-list-alt"></i>
                  📋 مثال عملی
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {helpModal.examples.map((example, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #ffeaa7'
                    }}>
                      <i className="fas fa-arrow-left" style={{
                        color: '#28a745',
                        marginTop: '2px',
                        fontSize: '0.9rem'
                      }}></i>
                      <span style={{
                        color: '#856404',
                        lineHeight: '1.5',
                        fontSize: '0.9rem'
                      }}>
                        {example}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* بخش نکات مهم */}
              <div style={{
                background: '#e8f5e8',
                border: '2px solid #4CAF50',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h4 style={{
                  margin: '0 0 15px 0',
                  color: '#2e7d32',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.1rem'
                }}>
                  <i className="fas fa-star"></i>
                  💡 نکات مهم
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <i className="fas fa-check-circle" style={{ color: '#4CAF50', marginTop: '2px' }}></i>
                    <span style={{ color: '#2e7d32', fontSize: '0.9rem' }}>
                      فایل‌های شما به صورت امن پردازش می‌شوند و بر روی سرور ذخیره نمی‌شوند
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <i className="fas fa-check-circle" style={{ color: '#4CAF50', marginTop: '2px' }}></i>
                    <span style={{ color: '#2e7d32', fontSize: '0.9rem' }}>
                      از فرمت‌های استاندارد Excel، CSV و PDF پشتیبانی می‌شود
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <i className="fas fa-check-circle" style={{ color: '#4CAF50', marginTop: '2px' }}></i>
                    <span style={{ color: '#2e7d32', fontSize: '0.9rem' }}>
                      نتیجه پردازش بلافاصله دانلود خواهد شد
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* فوتر مودال */}
            <div style={{
              padding: '20px 30px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '0 0 20px 20px',
              textAlign: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <button
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                }}
                onClick={closeHelp}
              >
                <i className="fas fa-thumbs-up"></i>
                متوجه شدم، بستن راهنما
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;