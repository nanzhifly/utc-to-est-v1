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
    
    // 初始化Flatpickr日期选择器（英文界面）
    if (typeof flatpickr !== 'undefined') {
        // 日期选择器配置
        const datePickerConfig = {
            dateFormat: "Y/m/d",
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
            defaultDate: new Date()
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
            hours = hours + direction;
            if (hours > maxHours) hours = minHours;
            if (hours < minHours) hours = maxHours;
            
            return hours.toString().padStart(2, '0');
        });
        
        // 添加小时变化事件
        hoursContainer.querySelectorAll('.arrow-btn').forEach(btn => {
            btn.addEventListener('click', updateTimeValue);
        });
        
        // 创建分钟控制
        const minutesContainer = createArrowControl('Minute', currentMinutes.toString().padStart(2, '0'), function(value, direction) {
            let minutes = parseInt(value);
            
            // 增加或减少分钟，并循环
            minutes = (minutes + direction + 60) % 60;
            
            return minutes.toString().padStart(2, '0');
        });
        
        // 添加分钟变化事件
        minutesContainer.querySelectorAll('.arrow-btn').forEach(btn => {
            btn.addEventListener('click', updateTimeValue);
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
                setTimeout(hideTimePicker, 200);
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
        
        // 添加点击外部关闭选择器的事件
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
        
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
            container.appendChild(valueElement);
            
            const downBtn = document.createElement('button');
            downBtn.className = 'arrow-btn down-btn';
            downBtn.innerHTML = '&#9660;'; // 下箭头符号
            downBtn.setAttribute('aria-label', `Decrease ${label}`);
            container.appendChild(downBtn);
            
            // 添加上箭头点击事件
            upBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                valueElement.textContent = updateValueFn(valueElement.textContent, 1);
            });
            
            // 添加下箭头点击事件
            downBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                valueElement.textContent = updateValueFn(valueElement.textContent, -1);
            });
            
            // 添加长按功能
            addLongPressHandler(upBtn, function() {
                valueElement.textContent = updateValueFn(valueElement.textContent, 1);
            });
            
            addLongPressHandler(downBtn, function() {
                valueElement.textContent = updateValueFn(valueElement.textContent, -1);
            });
            
            return container;
        }
        
        // 添加长按处理
        function addLongPressHandler(element, callback) {
            let intervalId = null;
            let delay = 500; // 初始延迟
            let interval = 100; // 重复间隔
            
            element.addEventListener('mousedown', function() {
                // 第一次立即执行
                callback();
                
                // 设置延迟后开始重复执行
                const timeoutId = setTimeout(function() {
                    intervalId = setInterval(callback, interval);
                }, delay);
                
                // 鼠标抬起或离开时清除定时器
                const clearTimers = function() {
                    clearTimeout(timeoutId);
                    clearInterval(intervalId);
                    element.removeEventListener('mouseup', clearTimers);
                    element.removeEventListener('mouseleave', clearTimers);
                };
                
                element.addEventListener('mouseup', clearTimers);
                element.addEventListener('mouseleave', clearTimers);
            });
        }
        
        // 更新时间值函数
        function updateTimeValue() {
            const hoursValue = hoursContainer.querySelector('.arrow-value').textContent;
            const minutesValue = minutesContainer.querySelector('.arrow-value').textContent;
            let finalHours = parseInt(hoursValue);
            
            // 处理12小时制的AM/PM转换
            if (!is24HourFormat) {
                const ampmValue = ampmContainer.querySelector('.arrow-value').textContent;
                const isSelectedPM = ampmValue === 'PM';
                
                if (isSelectedPM && finalHours < 12) {
                    finalHours += 12;
                } else if (!isSelectedPM && finalHours === 12) {
                    finalHours = 0;
                }
            }
            
            // 更新输入框的值
            utcTimeInput.value = `${finalHours.toString().padStart(2, '0')}:${minutesValue}`;
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
        
        if (!dateValue || !timeValue) {
            alert('Please select both date and time');
            return;
        }
        
        // 添加加载动画
        utcDisplay.textContent = "Converting...";
        estDisplay.textContent = "Converting...";
        
        // 添加转换动画效果
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
                // 处理Flatpickr格式的日期
                const dateComponents = dateValue.split('/');
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
                
                // 处理Flatpickr格式的日期
                const dateComponents = dateValue.split('/');
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
}); 