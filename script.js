document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const utcDateInput = document.getElementById('utc-date');
    const utcTimeInput = document.getElementById('utc-time');
    const convertBtn = document.getElementById('convert-btn');
    const utcDisplay = document.getElementById('utc-display');
    const estDisplay = document.getElementById('est-display');
    const timeDiff = document.getElementById('time-diff');
    const currentUtc = document.getElementById('current-utc');
    const currentEst = document.getElementById('current-est');
    const previewResult = document.getElementById('preview-result');
    
    // 复制按钮元素
    const copyUtcBtn = document.getElementById('copy-utc-btn');
    const copyEstBtn = document.getElementById('copy-est-btn');
    const copyCurrentUtcBtn = document.getElementById('copy-current-utc-btn');
    const copyCurrentEstBtn = document.getElementById('copy-current-est-btn');
    
    // 错误处理函数
    function showError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            
            // 添加错误样式到输入组
            const inputGroup = errorElement.closest('.input-group');
            if (inputGroup) {
                inputGroup.classList.add('error');
            }
        }
    }
    
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('show');
            
            // 移除输入组的错误样式
            const inputGroup = element.closest('.input-group');
            if (inputGroup) {
                inputGroup.classList.remove('error');
            }
        });
    }
    
    // 复制功能
    function setupCopyButton(button, sourceElement) {
        if (!button || !sourceElement) return;
        
        button.addEventListener('click', function() {
            // 创建一个临时文本区域
            const textarea = document.createElement('textarea');
            textarea.value = sourceElement.textContent;
            document.body.appendChild(textarea);
            
            // 选择并复制文本
            textarea.select();
            document.execCommand('copy');
            
            // 移除临时文本区域
            document.body.removeChild(textarea);
            
            // 显示复制成功的视觉反馈
            button.classList.add('copied');
            
            // 创建提示元素
            let tooltip = button.querySelector('.copy-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('span');
                tooltip.className = 'copy-tooltip';
                tooltip.textContent = 'Copied!';
                button.appendChild(tooltip);
            }
            
            // 显示提示
            tooltip.classList.add('show');
            
            // 2秒后移除样式
            setTimeout(() => {
                button.classList.remove('copied');
                tooltip.classList.remove('show');
            }, 2000);
        });
    }
    
    // 设置复制按钮
    setupCopyButton(copyUtcBtn, utcDisplay);
    setupCopyButton(copyEstBtn, estDisplay);
    setupCopyButton(copyCurrentUtcBtn, currentUtc);
    setupCopyButton(copyCurrentEstBtn, currentEst);
    
    // 初始化Flatpickr日期选择器（英文界面）
    if (typeof flatpickr !== 'undefined') {
        // 日期选择器配置
        const datePickerConfig = {
            dateFormat: "Y-m-d",
            locale: {
                firstDayOfWeek: 0, // 星期日为一周的第一天
                weekdays: {
                    shorthand: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    longhand: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                },
                months: {
                    shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    longhand: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                }
            },
            defaultDate: new Date(),
            onChange: function(selectedDates, dateStr) {
                // 当日期改变时更新预览
                updatePreview();
            }
        };
        
        // 初始化日期选择器
        const datePicker = flatpickr(utcDateInput, datePickerConfig);
    } else {
        // 如果Flatpickr未加载，回退到原生控件
        // Set today's date as default
        const today = new Date();
        utcDateInput.valueAsDate = today;
    }
    
    // 设置默认时间
    const now = new Date();
    let hours = now.getHours();
    const minutes = Math.floor(now.getMinutes() / 5) * 5;
    const minutesStr = minutes.toString().padStart(2, '0');
    
    // 默认使用12小时制
    let is24HourFormat = false;
    let isPM = hours >= 12;
    let hours12 = hours % 12;
    hours12 = hours12 === 0 ? 12 : hours12; // 12小时制中，0点显示为12点
    
    // 设置初始时间值
    utcTimeInput.value = is24HourFormat 
        ? `${hours.toString().padStart(2, '0')}:${minutesStr}`
        : `${hours12.toString().padStart(2, '0')}:${minutesStr}`;
    
    // 创建上下箭头时间选择器
    let timePickerVisible = false;
    let arrowTimePicker = null;
    
    // 为时间输入框添加点击和焦点事件
    utcTimeInput.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showTimePicker(e);
    });
    
    utcTimeInput.addEventListener('focus', function(e) {
        e.preventDefault();
        showTimePicker(e);
    });
    
    // 显示时间选择器
    function showTimePicker(e) {
        // 如果选择器已经显示，则不重复创建
        if (timePickerVisible) return;
        
        // 解析当前时间值
        const timeValue = utcTimeInput.value;
        const [hoursStr, minutesStr] = timeValue.split(':');
        let currentHours = parseInt(hoursStr);
        let currentMinutes = parseInt(minutesStr);
        
        // 确定AM/PM状态（针对12小时制）
        if (!is24HourFormat) {
            isPM = currentHours >= 12;
            currentHours = currentHours % 12;
            currentHours = currentHours === 0 ? 12 : currentHours;
        }
        
        // 创建时间选择器容器
        arrowTimePicker = document.createElement('div');
        arrowTimePicker.className = 'arrow-time-picker';
        
        // 创建时间选择器内容
        const timePickerContent = document.createElement('div');
        timePickerContent.className = 'time-picker-content';
        
        // 创建格式切换按钮
        const formatToggle = document.createElement('div');
        formatToggle.className = 'format-toggle';
        
        const formatToggleBtn = document.createElement('button');
        formatToggleBtn.className = 'format-toggle-btn';
        formatToggleBtn.textContent = is24HourFormat ? 'Switch to 12h' : 'Switch to 24h';
        formatToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            is24HourFormat = !is24HourFormat;
            
            // 重新渲染时间选择器
            document.body.removeChild(arrowTimePicker);
            timePickerVisible = false;
            showTimePicker(e);
        });
        
        formatToggle.appendChild(formatToggleBtn);
        timePickerContent.appendChild(formatToggle);
        
        // 创建上下箭头控制容器
        const arrowControlsContainer = document.createElement('div');
        arrowControlsContainer.className = 'arrow-controls-container';
        
        // 如果是12小时制，添加AM/PM控制
        let ampmContainer = null;
        if (!is24HourFormat) {
            ampmContainer = createArrowControl('AM/PM', isPM ? 'PM' : 'AM', function(value, direction) {
                // 在AM和PM之间切换
                return direction > 0 ? 'PM' : 'AM';
            });
            
            // 添加AM/PM变化事件
            const ampmValue = ampmContainer.querySelector('.arrow-value');
            ampmContainer.querySelectorAll('.arrow-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    // 更新AM/PM状态
                    isPM = ampmValue.textContent === 'PM';
                    updateTimeValue();
                });
            });
            
            arrowControlsContainer.appendChild(ampmContainer);
        }
        
        // 创建小时控制
        const hoursContainer = createArrowControl('Hour', currentHours.toString().padStart(2, '0'), function(value, direction) {
            let hours = parseInt(value);
            const maxHours = is24HourFormat ? 23 : 12;
            const minHours = is24HourFormat ? 0 : 1;
            
            // 增加或减少小时，并循环
            if (direction > 0) {
                hours = (hours >= maxHours) ? minHours : hours + 1;
            } else {
                hours = (hours <= minHours) ? maxHours : hours - 1;
            }
            
            return hours.toString().padStart(2, '0');
        });
        
        // 添加小时变化事件
        hoursContainer.querySelectorAll('.arrow-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                updateTimeValue();
                updatePreview();
            });
        });
        
        // 创建分钟控制
        const minutesContainer = createArrowControl('Minute', currentMinutes.toString().padStart(2, '0'), function(value, direction) {
            let minutes = parseInt(value);
            
            // 增加或减少分钟，并循环
            if (direction > 0) {
                minutes = (minutes >= 59) ? 0 : minutes + 1;
            } else {
                minutes = (minutes <= 0) ? 59 : minutes - 1;
            }
            
            return minutes.toString().padStart(2, '0');
        });
        
        // 添加分钟变化事件
        minutesContainer.querySelectorAll('.arrow-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                updateTimeValue();
                updatePreview();
            });
        });
        
        // 将控制器添加到容器
        arrowControlsContainer.appendChild(hoursContainer);
        arrowControlsContainer.appendChild(minutesContainer);
        
        timePickerContent.appendChild(arrowControlsContainer);
        
        // 添加快速时间选择按钮
        const quickTimeContainer = document.createElement('div');
        quickTimeContainer.className = 'quick-time-container';
        
        // 定义快捷时间
        const quickTimes = [
            { label: '12:00 AM', hour24: '00', minute: '00' },
            { label: '6:00 AM', hour24: '06', minute: '00' },
            { label: '12:00 PM', hour24: '12', minute: '00' },
            { label: '6:00 PM', hour24: '18', minute: '00' },
            { label: 'Now', hour24: hours.toString().padStart(2, '0'), minute: minutesStr }
        ];
        
        // 添加最近使用的时间
        const recentTimes = getRecentTimes();
        if (recentTimes.length > 0) {
            // 添加最近使用的标题
            const recentTitle = document.createElement('div');
            recentTitle.className = 'quick-time-title';
            recentTitle.textContent = 'Recent';
            quickTimeContainer.appendChild(recentTitle);
            
            // 添加最近使用的时间按钮
            recentTimes.forEach(time => {
                const recentTimeBtn = document.createElement('button');
                recentTimeBtn.className = 'quick-time-btn recent-time-btn';
                recentTimeBtn.textContent = time.display;
                
                // 添加点击事件
                recentTimeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 更新输入框的值
                    const hour24 = time.isPM && time.hour12 < 12 
                        ? time.hour12 + 12 
                        : (!time.isPM && time.hour12 === 12 ? 0 : time.hour12);
                    
                    utcTimeInput.value = `${hour24.toString().padStart(2, '0')}:${time.minute}`;
                    
                    // 选择后自动关闭选择器
                    setTimeout(function() {
                        hideTimePicker();
                        // 更新预览
                        updatePreview();
                    }, 200);
                });
                
                quickTimeContainer.appendChild(recentTimeBtn);
            });
            
            // 添加分隔线
            const divider = document.createElement('div');
            divider.className = 'quick-time-divider';
            quickTimeContainer.appendChild(divider);
        }
        
        // 添加预设快捷时间标题
        const presetsTitle = document.createElement('div');
        presetsTitle.className = 'quick-time-title';
        presetsTitle.textContent = 'Presets';
        quickTimeContainer.appendChild(presetsTitle);
        
        // 添加预设快捷时间按钮
        quickTimes.forEach(time => {
            const quickTimeBtn = document.createElement('button');
            quickTimeBtn.className = 'quick-time-btn';
            quickTimeBtn.textContent = time.label;
            
            // 添加点击事件
            quickTimeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // 更新输入框的值
                utcTimeInput.value = `${time.hour24}:${time.minute}`;
                
                // 选择后自动关闭选择器
                setTimeout(function() {
                    hideTimePicker();
                    // 更新预览
                    updatePreview();
                }, 200);
            });
            
            quickTimeContainer.appendChild(quickTimeBtn);
        });
        
        timePickerContent.appendChild(quickTimeContainer);
        
        // 添加确认和取消按钮
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-container';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'action-btn cancel-btn';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideTimePicker();
        });
        
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'action-btn confirm-btn';
        confirmBtn.textContent = 'Confirm';
        confirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideTimePicker();
        });
        
        actionContainer.appendChild(cancelBtn);
        actionContainer.appendChild(confirmBtn);
        
        timePickerContent.appendChild(actionContainer);
        
        arrowTimePicker.appendChild(timePickerContent);
        
        // 将时间选择器添加到页面
        document.body.appendChild(arrowTimePicker);
        
        // 定位时间选择器
        positionTimePicker();
        
        // 标记时间选择器为可见
        timePickerVisible = true;
        
        // 阻止事件冒泡
        arrowTimePicker.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // 添加键盘支持
        document.addEventListener('keydown', handleKeyboardNavigation);
        
        // 添加点击外部关闭选择器的事件
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
        
        // 键盘导航处理
        function handleKeyboardNavigation(e) {
            if (!timePickerVisible) return;
            
            // 阻止默认行为，防止页面滚动
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab'].includes(e.key)) {
                e.preventDefault();
            }
            
            // 如果当前有输入框处于活动状态，则不处理导航
            if (document.activeElement.tagName === 'INPUT') {
                return;
            }
            
            switch (e.key) {
                case 'ArrowUp':
                    // 增加当前选中的值
                    if (document.activeElement.classList.contains('arrow-btn') && 
                        document.activeElement.classList.contains('up-btn')) {
                        document.activeElement.click();
                    } else if (document.activeElement.classList.contains('arrow-value')) {
                        // 如果值元素被聚焦，则增加其值
                        const container = document.activeElement.closest('.arrow-control');
                        const upBtn = container.querySelector('.up-btn');
                        upBtn.click();
                    } else {
                        // 找到最近的上箭头按钮并点击
                        const upBtns = arrowTimePicker.querySelectorAll('.up-btn');
                        if (upBtns.length > 0) {
                            // 默认选择小时的上箭头
                            const hourUpBtn = hoursContainer.querySelector('.up-btn');
                            hourUpBtn.click();
                            hourUpBtn.focus();
                        }
                    }
                    break;
                    
                case 'ArrowDown':
                    // 减少当前选中的值
                    if (document.activeElement.classList.contains('arrow-btn') && 
                        document.activeElement.classList.contains('down-btn')) {
                        document.activeElement.click();
                    } else if (document.activeElement.classList.contains('arrow-value')) {
                        // 如果值元素被聚焦，则减少其值
                        const container = document.activeElement.closest('.arrow-control');
                        const downBtn = container.querySelector('.down-btn');
                        downBtn.click();
                    } else {
                        // 找到最近的下箭头按钮并点击
                        const downBtns = arrowTimePicker.querySelectorAll('.down-btn');
                        if (downBtns.length > 0) {
                            // 默认选择小时的下箭头
                            const hourDownBtn = hoursContainer.querySelector('.down-btn');
                            hourDownBtn.click();
                            hourDownBtn.focus();
                        }
                    }
                    break;
                    
                case 'ArrowLeft':
                    // 在控制之间向左移动焦点
                    if (document.activeElement.closest('.arrow-control') === minutesContainer) {
                        // 从分钟移动到小时
                        const hourValue = hoursContainer.querySelector('.arrow-value');
                        if (hourValue) hourValue.focus();
                    } else if (!is24HourFormat && document.activeElement.closest('.arrow-control') === hoursContainer) {
                        // 从小时移动到AM/PM
                        const ampmValue = ampmContainer.querySelector('.arrow-value');
                        if (ampmValue) ampmValue.focus();
                    }
                    break;
                    
                case 'ArrowRight':
                    // 在控制之间向右移动焦点
                    if (!is24HourFormat && document.activeElement.closest('.arrow-control') === ampmContainer) {
                        // 从AM/PM移动到小时
                        const hourValue = hoursContainer.querySelector('.arrow-value');
                        if (hourValue) hourValue.focus();
                    } else if (document.activeElement.closest('.arrow-control') === hoursContainer) {
                        // 从小时移动到分钟
                        const minuteValue = minutesContainer.querySelector('.arrow-value');
                        if (minuteValue) minuteValue.focus();
                    }
                    break;
                    
                case 'Enter':
                    // 不再进入编辑模式，直接确认选择
                    const confirmBtn = arrowTimePicker.querySelector('.confirm-btn');
                    if (confirmBtn) confirmBtn.click();
                    break;
                    
                case 'Escape':
                    // 取消选择
                    hideTimePicker();
                    break;
                    
                case 'Tab':
                    // 在控制之间循环焦点
                    const focusableElements = arrowTimePicker.querySelectorAll('button, .arrow-value');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey) {
                        // Shift+Tab - 向后循环
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        // Tab - 向前循环
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                    break;
                    
                // 数字键不再触发编辑模式
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    // 不做任何处理，不再触发编辑模式
                    break;
                    
                // A/P键切换AM/PM
                case 'a': case 'A':
                    if (!is24HourFormat) {
                        const ampmValue = ampmContainer.querySelector('.arrow-value');
                        if (ampmValue.textContent !== 'AM') {
                            ampmValue.textContent = 'AM';
                            isPM = false;
                            updateTimeValue();
                            updatePreview();
                        }
                    }
                    break;
                    
                case 'p': case 'P':
                    if (!is24HourFormat) {
                        const ampmValue = ampmContainer.querySelector('.arrow-value');
                        if (ampmValue.textContent !== 'PM') {
                            ampmValue.textContent = 'PM';
                            isPM = true;
                            updateTimeValue();
                            updatePreview();
                        }
                    }
                    break;
            }
        }
        
        // 创建上下箭头控制组件
        function createArrowControl(label, initialValue, updateValueFn) {
            const container = document.createElement('div');
            container.className = 'arrow-control';
            
            const labelElement = document.createElement('div');
            labelElement.className = 'arrow-label';
            labelElement.textContent = label;
            container.appendChild(labelElement);
            
            const upBtn = document.createElement('button');
            upBtn.className = 'arrow-btn up-btn';
            upBtn.innerHTML = '&#9650;'; // 上箭头符号
            upBtn.setAttribute('aria-label', `Increase ${label}`);
            container.appendChild(upBtn);
            
            const valueElement = document.createElement('div');
            valueElement.className = 'arrow-value';
            valueElement.textContent = initialValue;
            valueElement.setAttribute('tabindex', '0'); // 使元素可聚焦
            valueElement.setAttribute('role', 'textbox'); // 设置ARIA角色
            valueElement.setAttribute('aria-label', `${label} value`);
            
            container.appendChild(valueElement);
            
            const downBtn = document.createElement('button');
            downBtn.className = 'arrow-btn down-btn';
            downBtn.innerHTML = '&#9660;'; // 下箭头符号
            downBtn.setAttribute('aria-label', `Decrease ${label}`);
            container.appendChild(downBtn);
            
            // 单击增加值的函数
            function increaseValue() {
                try {
                    // 确保当前值是有效的
                    let currentValue = valueElement.textContent;
                    if (currentValue === 'NaN') {
                        // 如果值是NaN，重置为初始值
                        if (label === 'Hour') {
                            currentValue = is24HourFormat ? '00' : '12';
                        } else if (label === 'Minute') {
                            currentValue = '00';
                        } else if (label === 'AM/PM') {
                            currentValue = 'AM';
                        }
                    }
                    
                    // 对于小时值，确保正确解析
                    if (label === 'Hour') {
                        let hours = parseInt(currentValue);
                        if (isNaN(hours)) {
                            hours = is24HourFormat ? 0 : 12;
                        }
                        
                        const maxHours = is24HourFormat ? 23 : 12;
                        const minHours = is24HourFormat ? 0 : 1;
                        
                        // 直接计算新值，避免使用回调函数
                        hours = (hours >= maxHours) ? minHours : hours + 1;
                        
                        // 更新显示的值
                        valueElement.textContent = hours.toString().padStart(2, '0');
                        
                        // 强制同步DOM更新
                        document.body.offsetHeight; // 触发全局重排，确保DOM更新
                        
                        // 同步更新时间值和预览
                        updateTimeValue();
                        updatePreview();
                    } else {
                        // 对于其他值，使用更新函数
                        const newValue = updateValueFn(currentValue, 1);
                        valueElement.textContent = newValue;
                        
                        // 强制同步DOM更新
                        document.body.offsetHeight; // 触发全局重排，确保DOM更新
                        
                        // 更新时间值和预览
                        if (label === 'Minute' || label === 'AM/PM') {
                            updateTimeValue();
                            updatePreview();
                        }
                    }
                } catch (error) {
                    console.error('Error increasing value:', error);
                    // 恢复到安全值
                    if (label === 'Hour') {
                        valueElement.textContent = is24HourFormat ? '00' : '12';
                    } else if (label === 'Minute') {
                        valueElement.textContent = '00';
                    } else if (label === 'AM/PM') {
                        valueElement.textContent = 'AM';
                    }
                    updateTimeValue();
                    updatePreview();
                }
            }
            
            // 单击减少值的函数
            function decreaseValue() {
                try {
                    // 确保当前值是有效的
                    let currentValue = valueElement.textContent;
                    if (currentValue === 'NaN') {
                        // 如果值是NaN，重置为初始值
                        if (label === 'Hour') {
                            currentValue = is24HourFormat ? '00' : '12';
                        } else if (label === 'Minute') {
                            currentValue = '00';
                        } else if (label === 'AM/PM') {
                            currentValue = 'AM';
                        }
                    }
                    
                    // 对于小时值，确保正确解析
                    if (label === 'Hour') {
                        let hours = parseInt(currentValue);
                        if (isNaN(hours)) {
                            hours = is24HourFormat ? 0 : 12;
                        }
                        
                        const maxHours = is24HourFormat ? 23 : 12;
                        const minHours = is24HourFormat ? 0 : 1;
                        
                        // 直接计算新值，避免使用回调函数
                        hours = (hours <= minHours) ? maxHours : hours - 1;
                        
                        // 更新显示的值
                        valueElement.textContent = hours.toString().padStart(2, '0');
                        
                        // 强制同步DOM更新
                        document.body.offsetHeight; // 触发全局重排，确保DOM更新
                        
                        // 同步更新时间值和预览
                        updateTimeValue();
                        updatePreview();
                    } else {
                        // 对于其他值，使用更新函数
                        const newValue = updateValueFn(currentValue, -1);
                        valueElement.textContent = newValue;
                        
                        // 强制同步DOM更新
                        document.body.offsetHeight; // 触发全局重排，确保DOM更新
                        
                        // 更新时间值和预览
                        if (label === 'Minute' || label === 'AM/PM') {
                            updateTimeValue();
                            updatePreview();
                        }
                    }
                } catch (error) {
                    console.error('Error decreasing value:', error);
                    // 恢复到安全值
                    if (label === 'Hour') {
                        valueElement.textContent = is24HourFormat ? '00' : '12';
                    } else if (label === 'Minute') {
                        valueElement.textContent = '00';
                    } else if (label === 'AM/PM') {
                        valueElement.textContent = 'AM';
                    }
                    updateTimeValue();
                    updatePreview();
                }
            }
            
            // 添加上箭头点击事件
            upBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                increaseValue();
            });
            
            // 添加下箭头点击事件
            downBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                decreaseValue();
            });
            
            // 添加长按处理
            addLongPressHandler(upBtn, increaseValue);
            addLongPressHandler(downBtn, decreaseValue);
            
            return container;
        }
        
        // 添加长按处理
        function addLongPressHandler(element, callback) {
            // 使用闭包保存状态
            let isPressed = false;
            let timeoutId = null;
            let rafId = null;
            let lastExecutionTime = 0;
            
            // 初始延迟和重复间隔
            const initialDelay = 600; // 初始延迟600ms
            const repeatInterval = 500; // 增加间隔到500ms，进一步减慢变化速度
            
            // 开始长按
            function startLongPress(e) {
                // 防止默认行为和事件冒泡
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                // 设置状态为按下
                isPressed = true;
                
                // 第一次立即执行
                executeCallback();
                
                // 清除任何现有的计时器
                clearTimeout(timeoutId);
                cancelAnimationFrame(rafId);
                
                // 设置延迟后开始重复执行
                timeoutId = setTimeout(function() {
                    scheduleNextExecution();
                }, initialDelay);
            }
            
            // 安排下一次执行
            function scheduleNextExecution() {
                if (!isPressed) return;
                
                const now = Date.now();
                const elapsed = now - lastExecutionTime;
                
                if (elapsed >= repeatInterval) {
                    // 如果已经过了足够的时间，立即执行
                    executeCallback();
                    scheduleNextExecution();
                } else {
                    // 否则，等待剩余时间后执行
                    const remainingTime = repeatInterval - elapsed;
                    timeoutId = setTimeout(function() {
                        executeCallback();
                        scheduleNextExecution();
                    }, remainingTime);
                }
            }
            
            // 执行回调
            function executeCallback() {
                if (!isPressed) return;
                
                // 记录执行时间
                lastExecutionTime = Date.now();
                
                // 使用requestAnimationFrame确保在下一帧执行
                rafId = requestAnimationFrame(function() {
                    // 执行回调
                    callback();
                    
                    // 强制浏览器重新计算布局，确保DOM更新
                    const valueElement = element.closest('.arrow-control').querySelector('.arrow-value');
                    if (valueElement) {
                        // 触发重排
                        document.body.offsetHeight; // 使用全局重排而不是局部重排
                    }
                });
            }
            
            // 停止长按
            function stopLongPress(e) {
                // 防止默认行为和事件冒泡
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                // 设置状态为未按下
                isPressed = false;
                
                // 清除所有计时器和动画帧
                clearTimeout(timeoutId);
                cancelAnimationFrame(rafId);
            }
            
            // 添加事件监听器
            element.addEventListener('mousedown', startLongPress);
            element.addEventListener('touchstart', function(e) {
                e.preventDefault(); // 防止触摸事件的默认行为
                startLongPress(e);
            });
            
            // 添加停止事件监听器
            element.addEventListener('mouseup', stopLongPress);
            element.addEventListener('mouseleave', stopLongPress);
            element.addEventListener('touchend', stopLongPress);
            element.addEventListener('touchcancel', stopLongPress);
            
            // 确保在元素从DOM中移除时清理事件监听器
            return function cleanup() {
                element.removeEventListener('mousedown', startLongPress);
                element.removeEventListener('touchstart', startLongPress);
                element.removeEventListener('mouseup', stopLongPress);
                element.removeEventListener('mouseleave', stopLongPress);
                element.removeEventListener('touchend', stopLongPress);
                element.removeEventListener('touchcancel', stopLongPress);
                
                // 清除任何可能仍在运行的计时器和动画帧
                clearTimeout(timeoutId);
                cancelAnimationFrame(rafId);
            };
        }
        
        // 使值可编辑的函数
        function makeEditable(element, label) {
            // 创建一个临时输入框
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'editable-input';
            input.value = element.textContent;
            input.style.width = '100%';
            input.style.height = '100%';
            input.style.textAlign = 'center';
            input.style.fontSize = '1.5rem';
            input.style.fontWeight = '700';
            input.style.color = 'var(--primary-color)';
            input.style.background = 'transparent';
            input.style.border = 'none';
            input.style.outline = 'none';
            input.style.padding = '0';
            
            // 设置输入限制
            if (label === 'Hour') {
                input.setAttribute('maxlength', '2');
                input.setAttribute('pattern', is24HourFormat ? '[0-9]|[0-1][0-9]|2[0-3]' : '[0-9]|1[0-2]');
            } else if (label === 'Minute') {
                input.setAttribute('maxlength', '2');
                input.setAttribute('pattern', '[0-5][0-9]');
            } else if (label === 'AM/PM') {
                // AM/PM不需要直接输入，但可以通过A/P键切换
                element.focus();
                return;
            }
            
            // 替换原有内容
            element.textContent = '';
            element.appendChild(input);
            
            // 聚焦并选中全部文本
            input.focus();
            input.select();
            
            // 处理输入完成
            function completeEdit() {
                let newValue = input.value.trim();
                
                // 验证和格式化输入
                if (label === 'Hour') {
                    let hourValue = parseInt(newValue);
                    if (isNaN(hourValue)) {
                        hourValue = parseInt(element.getAttribute('data-original-value') || '0');
                    }
                    
                    const maxHours = is24HourFormat ? 23 : 12;
                    const minHours = is24HourFormat ? 0 : 1;
                    
                    // 确保小时值在有效范围内
                    if (hourValue > maxHours) hourValue = maxHours;
                    if (hourValue < minHours) hourValue = minHours;
                    
                    newValue = hourValue.toString().padStart(2, '0');
                } else if (label === 'Minute') {
                    let minuteValue = parseInt(newValue);
                    if (isNaN(minuteValue)) {
                        minuteValue = parseInt(element.getAttribute('data-original-value') || '0');
                    }
                    
                    // 确保分钟值在有效范围内
                    if (minuteValue > 59) minuteValue = 59;
                    if (minuteValue < 0) minuteValue = 0;
                    
                    newValue = minuteValue.toString().padStart(2, '0');
                }
                
                // 恢复原始显示
                element.textContent = newValue;
                
                // 更新时间值
                updateTimeValue();
                updatePreview();
            }
            
            // 添加事件监听器
            input.addEventListener('blur', completeEdit);
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    completeEdit();
                    element.focus();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    element.textContent = element.getAttribute('data-original-value') || element.textContent;
                    element.focus();
                } else if (label === 'Hour' || label === 'Minute') {
                    // 只允许输入数字和控制键
                    if (!/^\d$/.test(e.key) && 
                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                    }
                }
            });
            
            // 保存原始值以便取消
            element.setAttribute('data-original-value', element.textContent);
        }
        
        // 更新时间值函数
        function updateTimeValue() {
            try {
                const hoursElement = hoursContainer.querySelector('.arrow-value');
                const minutesElement = minutesContainer.querySelector('.arrow-value');
                
                // 确保元素存在
                if (!hoursElement || !minutesElement) return;
                
                const hoursValue = hoursElement.textContent;
                const minutesValue = minutesElement.textContent;
                
                // 检查值是否有效
                if (hoursValue === 'NaN' || minutesValue === 'NaN') {
                    console.error('Invalid time values detected');
                    return;
                }
                
                let finalHours = parseInt(hoursValue);
                
                // 检查小时值是否为有效数字
                if (isNaN(finalHours)) {
                    console.error('Hours value is not a number:', hoursValue);
                    finalHours = is24HourFormat ? 0 : 12;
                    hoursElement.textContent = finalHours.toString().padStart(2, '0');
                }
                
                // 处理12小时制的AM/PM转换
                if (!is24HourFormat) {
                    const ampmElement = ampmContainer.querySelector('.arrow-value');
                    if (ampmElement) {
                        const ampmValue = ampmElement.textContent;
                        const isSelectedPM = ampmValue === 'PM';
                        
                        if (isSelectedPM && finalHours < 12) {
                            finalHours += 12;
                        } else if (!isSelectedPM && finalHours === 12) {
                            finalHours = 0;
                        }
                    }
                }
                
                // 更新输入框的值
                utcTimeInput.value = `${finalHours.toString().padStart(2, '0')}:${minutesValue}`;
            } catch (error) {
                console.error('Error updating time value:', error);
                // 恢复到安全的默认值
                utcTimeInput.value = is24HourFormat ? '00:00' : '12:00';
            }
        }
    }
    
    // 隐藏时间选择器
    function hideTimePicker() {
        if (arrowTimePicker) {
            document.body.removeChild(arrowTimePicker);
            arrowTimePicker = null;
            timePickerVisible = false;
            
            // 移除点击外部关闭选择器的事件
            document.removeEventListener('click', handleOutsideClick);
            
            // 移除键盘导航事件
            document.removeEventListener('keydown', handleKeyboardNavigation);
        }
    }
    
    // 处理点击外部关闭选择器
    function handleOutsideClick(e) {
        if (arrowTimePicker && !arrowTimePicker.contains(e.target) && e.target !== utcTimeInput) {
            hideTimePicker();
        }
    }
    
    // 定位时间选择器
    function positionTimePicker() {
        if (!arrowTimePicker) return;
        
        const inputRect = utcTimeInput.getBoundingClientRect();
        const pickerRect = arrowTimePicker.getBoundingClientRect();
        
        // 计算时间选择器的位置
        let top = inputRect.bottom + window.scrollY + 5; // 添加5px的间距
        let left = inputRect.left + window.scrollX;
        
        // 检查是否会超出视口底部
        if (top + pickerRect.height > window.innerHeight + window.scrollY) {
            top = inputRect.top + window.scrollY - pickerRect.height - 5; // 添加5px的间距
        }
        
        // 检查是否会超出视口右侧
        if (left + pickerRect.width > window.innerWidth + window.scrollX) {
            left = window.innerWidth + window.scrollX - pickerRect.width - 10; // 添加10px的边距
        }
        
        // 设置时间选择器的位置
        arrowTimePicker.style.top = `${top}px`;
        arrowTimePicker.style.left = `${left}px`;
    }
    
    // 新增的双向转换元素
    const toggleDirectionBtn = document.getElementById('toggle-direction');
    const directionText = document.getElementById('direction-text');
    const convertDirection = document.getElementById('convert-direction');
    const sourceDateLabel = document.getElementById('source-date-label');
    const sourceTimeLabel = document.getElementById('source-time-label');
    const sourceLabel = document.getElementById('source-label');
    const targetLabel = document.getElementById('target-label');
    const conversionArrow = document.getElementById('conversion-arrow');
    
    // 转换方向状态 (true = UTC to EST, false = EST to UTC)
    let isUtcToEst = true;

    // Update current times
    updateCurrentTimes();
    // Update current times every second
    setInterval(updateCurrentTimes, 1000);

    // Add event listener to convert button
    convertBtn.addEventListener('click', convertTime);
    
    // 添加切换方向按钮事件监听
    toggleDirectionBtn.addEventListener('click', toggleDirection);
    
    // 切换转换方向
    function toggleDirection() {
        isUtcToEst = !isUtcToEst;
        
        if (isUtcToEst) {
            // UTC to EST
            directionText.textContent = "Switch to EST → UTC";
            convertDirection.textContent = "UTC to EST";
            sourceDateLabel.textContent = "UTC Date:";
            sourceTimeLabel.textContent = "UTC Time:";
            sourceLabel.textContent = "UTC Time";
            targetLabel.textContent = "EST Time";
            conversionArrow.classList.remove('reversed');
            timeDiff.textContent = "UTC is 5 hours ahead of EST";
        } else {
            // EST to UTC
            directionText.textContent = "Switch to UTC → EST";
            convertDirection.textContent = "EST to UTC";
            sourceDateLabel.textContent = "EST Date:";
            sourceTimeLabel.textContent = "EST Time:";
            sourceLabel.textContent = "EST Time";
            targetLabel.textContent = "UTC Time";
            conversionArrow.classList.add('reversed');
            timeDiff.textContent = "EST is 5 hours behind UTC";
        }
        
        // 重置显示
        utcDisplay.textContent = "--:-- --";
        estDisplay.textContent = "--:-- --";
        
        // 更新预览
        updatePreview();
        
        // 添加切换动画
        document.querySelectorAll('.time-card').forEach(card => {
            card.classList.add('converted');
            setTimeout(() => {
                card.classList.remove('converted');
            }, 1000);
        });
    }

    // Function to convert UTC to EST
    function convertTime() {
        // Get input values
        const dateValue = utcDateInput.value;
        const timeValue = utcTimeInput.value;
        
        // 清除之前的错误提示
        clearErrors();
        
        // 验证输入
        let hasError = false;
        
        if (!dateValue) {
            showError('date-error', 'Please select a date');
            hasError = true;
        }
        
        if (!timeValue) {
            showError('time-error', 'Please select a time');
            hasError = true;
        }
        
        if (hasError) {
            return;
        }
        
        // 保存当前时间到最近使用
        saveCurrentTimeAsRecent();
        
        // 添加加载动画
        utcDisplay.innerHTML = '<span class="loading-text">Converting</span>';
        estDisplay.innerHTML = '<span class="loading-text">Converting</span>';
        
        // 禁用转换按钮，防止重复点击
        convertBtn.disabled = true;
        convertBtn.classList.add('disabled');
        
        // 添加加载动画效果
        document.querySelectorAll('.time-card').forEach(card => {
            card.classList.add('converting');
        });
        
        // 延迟一小段时间以显示动画效果
        setTimeout(() => {
            let sourceDate, targetDate, formattedSource, formattedTarget;
            
            if (isUtcToEst) {
                // UTC to EST conversion
                // Create UTC date object
                const [hours, minutes] = timeValue.split(':');
                // 处理日期格式
                const dateComponents = dateValue.split('-');
                const year = dateComponents[0];
                const month = dateComponents[1];
                const day = dateComponents[2];
                sourceDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);
                
                // Format UTC time for display
                const utcOptions = { 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    second: 'numeric',
                    timeZone: 'UTC',
                    hour12: true
                };
                formattedSource = new Intl.DateTimeFormat('en-US', utcOptions).format(sourceDate);
                
                // Format EST time for display
                const estOptions = { 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    second: 'numeric',
                    timeZone: 'America/New_York',
                    hour12: true
                };
                formattedTarget = new Intl.DateTimeFormat('en-US', estOptions).format(sourceDate);
                
                // Determine if EST or EDT and show the correct time difference
                targetDate = new Date(sourceDate.toLocaleString('en-US', {timeZone: 'America/New_York'}));
                const offset = (sourceDate - targetDate) / (1000 * 60 * 60);
                
                if (offset === 5) {
                    timeDiff.textContent = 'UTC is 5 hours ahead of EST';
                } else if (offset === 4) {
                    timeDiff.textContent = 'UTC is 4 hours ahead of EDT';
                }
            } else {
                // EST to UTC conversion
                // Create EST date object (need to adjust for timezone)
                const [hours, minutes] = timeValue.split(':');
                
                // 处理日期格式
                const dateComponents = dateValue.split('-');
                const year = dateComponents[0];
                const month = dateComponents[1];
                const day = dateComponents[2];
                
                // 创建一个本地日期对象
                const localDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
                
                // 获取EST时区的偏移量（分钟）
                const estDate = new Date(localDate.toLocaleString('en-US', {timeZone: 'America/New_York'}));
                const estOffset = (localDate - estDate) / (1000 * 60);
                
                // 调整时间以获得正确的EST时间
                sourceDate = new Date(localDate.getTime() - estOffset);
                
                // 将EST时间转换为UTC时间（添加时差）
                // 检查是否为夏令时
                const isDST = isDaylightSavingTime(sourceDate);
                const hoursToAdd = isDST ? 4 : 5;
                
                targetDate = new Date(sourceDate.getTime() + hoursToAdd * 60 * 60 * 1000);
                
                // 格式化显示
                const estOptions = { 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    second: 'numeric',
                    timeZone: 'America/New_York',
                    hour12: true
                };
                formattedSource = new Intl.DateTimeFormat('en-US', estOptions).format(sourceDate);
                
                const utcOptions = { 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    second: 'numeric',
                    timeZone: 'UTC',
                    hour12: true
                };
                formattedTarget = new Intl.DateTimeFormat('en-US', utcOptions).format(targetDate);
                
                // 更新时差显示
                if (isDST) {
                    timeDiff.textContent = 'EDT is 4 hours behind UTC';
                } else {
                    timeDiff.textContent = 'EST is 5 hours behind UTC';
                }
            }
            
            // Display the results
            utcDisplay.textContent = isUtcToEst ? formattedSource : formattedTarget;
            estDisplay.textContent = isUtcToEst ? formattedTarget : formattedSource;
            
            // 移除转换动画类
            document.querySelectorAll('.time-card').forEach(card => {
                card.classList.remove('converting');
                card.classList.add('converted');
                
                // 短暂后移除转换完成类
                setTimeout(() => {
                    card.classList.remove('converted');
                }, 1000);
            });
            
            // 启用转换按钮
            convertBtn.disabled = false;
            convertBtn.classList.remove('disabled');
        }, 500);
    }
    
    // 检查日期是否处于夏令时
    function isDaylightSavingTime(date) {
        // 美国夏令时规则：3月第二个周日开始，11月第一个周日结束
        const year = date.getFullYear();
        
        // 3月第二个周日
        let dstStart = new Date(year, 2, 1);
        dstStart.setDate(dstStart.getDate() + (14 - dstStart.getDay()) % 7);
        dstStart.setHours(2, 0, 0, 0);
        
        // 11月第一个周日
        let dstEnd = new Date(year, 10, 1);
        dstEnd.setDate(dstEnd.getDate() + (7 - dstEnd.getDay()) % 7);
        dstEnd.setHours(2, 0, 0, 0);
        
        return date >= dstStart && date < dstEnd;
    }

    // Function to update current times
    function updateCurrentTimes() {
        const now = new Date();
        
        // Format current UTC time
        const utcOptions = { 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric',
            timeZone: 'UTC',
            hour12: true,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        };
        
        // Format current EST time
        const estOptions = { 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric',
            timeZone: 'America/New_York',
            hour12: true,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        };
        
        currentUtc.textContent = new Intl.DateTimeFormat('en-US', utcOptions).format(now);
        currentEst.textContent = new Intl.DateTimeFormat('en-US', estOptions).format(now);
    }

    // Add FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const heading = item.querySelector('h3');
        const content = item.querySelector('p');
        
        // Initially show all content for SEO purposes
        // In a real implementation, you might want to toggle visibility
        
        heading.addEventListener('click', () => {
            // Toggle active class for styling
            item.classList.toggle('active');
        });
    });

    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // In a real implementation, you would send this data to a server
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }

    // 实时预览功能
    function updatePreview() {
        const dateValue = utcDateInput.value;
        const timeValue = utcTimeInput.value;
        
        if (!dateValue || !timeValue) {
            previewResult.textContent = 'Select date and time to see preview';
            previewResult.classList.add('empty');
            return;
        }
        
        previewResult.classList.remove('empty');
        
        try {
            let previewText = '';
            
            if (isUtcToEst) {
                // UTC to EST conversion preview
                const [hours, minutes] = timeValue.split(':');
                const dateComponents = dateValue.split('-');
                const year = dateComponents[0];
                const month = dateComponents[1];
                const day = dateComponents[2];
                
                const sourceDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);
                
                // Format EST time for preview
                const estOptions = { 
                    hour: 'numeric', 
                    minute: 'numeric',
                    timeZone: 'America/New_York',
                    hour12: true
                };
                
                const formattedEst = new Intl.DateTimeFormat('en-US', estOptions).format(sourceDate);
                previewText = `${timeValue} UTC = ${formattedEst} EST`;
            } else {
                // EST to UTC conversion preview
                const [hours, minutes] = timeValue.split(':');
                const dateComponents = dateValue.split('-');
                const year = dateComponents[0];
                const month = dateComponents[1];
                const day = dateComponents[2];
                
                // 创建一个本地日期对象
                const localDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
                
                // 获取EST时区的偏移量（分钟）
                const estDate = new Date(localDate.toLocaleString('en-US', {timeZone: 'America/New_York'}));
                const estOffset = (localDate - estDate) / (1000 * 60);
                
                // 调整时间以获得正确的EST时间
                const sourceDate = new Date(localDate.getTime() - estOffset);
                
                // 将EST时间转换为UTC时间（添加时差）
                // 检查是否为夏令时
                const isDST = isDaylightSavingTime(sourceDate);
                const hoursToAdd = isDST ? 4 : 5;
                
                const targetDate = new Date(sourceDate.getTime() + hoursToAdd * 60 * 60 * 1000);
                
                // 格式化UTC时间
                const utcOptions = { 
                    hour: 'numeric', 
                    minute: 'numeric',
                    timeZone: 'UTC',
                    hour12: true
                };
                
                const formattedUtc = new Intl.DateTimeFormat('en-US', utcOptions).format(targetDate);
                previewText = `${timeValue} EST = ${formattedUtc} UTC`;
            }
            
            previewResult.textContent = previewText;
        } catch (error) {
            previewResult.textContent = 'Invalid date/time format';
            previewResult.classList.add('empty');
        }
    }
    
    // 初始更新预览
    setTimeout(updatePreview, 500);

    // 最近使用的时间存储和管理
    const RECENT_TIMES_KEY = 'utc_est_recent_times';
    const MAX_RECENT_TIMES = 3;
    
    // 获取最近使用的时间
    function getRecentTimes() {
        try {
            const storedTimes = localStorage.getItem(RECENT_TIMES_KEY);
            return storedTimes ? JSON.parse(storedTimes) : [];
        } catch (error) {
            console.error('Error retrieving recent times:', error);
            return [];
        }
    }
    
    // 保存最近使用的时间
    function saveRecentTime(time) {
        try {
            const recentTimes = getRecentTimes();
            
            // 检查是否已存在相同的时间
            const existingIndex = recentTimes.findIndex(item => 
                item.hour === time.hour && item.minute === time.minute && item.isPM === time.isPM);
            
            // 如果已存在，先移除
            if (existingIndex !== -1) {
                recentTimes.splice(existingIndex, 1);
            }
            
            // 添加到最前面
            recentTimes.unshift(time);
            
            // 保持最大数量限制
            if (recentTimes.length > MAX_RECENT_TIMES) {
                recentTimes.pop();
            }
            
            localStorage.setItem(RECENT_TIMES_KEY, JSON.stringify(recentTimes));
        } catch (error) {
            console.error('Error saving recent time:', error);
        }
    }
    
    // 在转换时保存当前时间
    function saveCurrentTimeAsRecent() {
        const timeValue = utcTimeInput.value;
        if (!timeValue) return;
        
        const [hours, minutes] = timeValue.split(':');
        const hour = parseInt(hours);
        const isPM = hour >= 12;
        const hour12 = hour % 12 || 12;
        
        saveRecentTime({
            hour: hour,
            minute: minutes,
            isPM: isPM,
            hour12: hour12,
            display: `${hour12}:${minutes} ${isPM ? 'PM' : 'AM'}`
        });
    }
}); 