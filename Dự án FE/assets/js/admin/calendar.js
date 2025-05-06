// Hàm logout
function logout() {
    localStorage.removeItem('loggedInUser'); 
    location.href = '../../pages/auth/login.html';   
}
// Hàm hiển thị danh sách lớp học trong select
function renderClassTypes() {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    const classTypeSelect = document.getElementById('class-type');  
    const filterClassSelect = document.getElementById('filter-class');   
    // Cập nhật select trong modal
    classTypeSelect.innerHTML = '<option value="">Chọn lớp học</option>';
    services.forEach(service => { 
        const option = document.createElement('option');
        option.value = service.name;   // Đặt giá trị của option là tên dịch vụ (ví dụ: "Gym", "Yoga")
        option.textContent = service.name;  
        classTypeSelect.appendChild(option); 
    });
    // Cập nhật select trong bộ lọc
    filterClassSelect.innerHTML = '<option value="">Tất cả</option>';  // Xóa nội dung cũ của select và thêm tùy chọn mặc định "Tất cả"
    services.forEach(service => {  
        const option = document.createElement('option');  
        option.value = service.name;
        option.textContent = service.name; 
        filterClassSelect.appendChild(option);  
    });
}
// Hàm hiển thị danh sách lịch
function renderSchedules(filteredSchedules = null) { 
    const schedules = JSON.parse(localStorage.getItem('schedules')) || []; 
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = ''; // Xóa toàn bộ nội dung hiện tại của bảng lịch để chuẩn bị hiển thị dữ liệu mới
    const displaySchedules = filteredSchedules !== null ? filteredSchedules : schedules;
    displaySchedules.forEach((schedule, index) => {  
        const row = document.createElement('tr');  
        row.innerHTML = `
            <td>${schedule.classType || ''}</td>
            <td>${schedule.date || ''}</td>
            <td>${schedule.timeSlot || ''}</td>
            <td>${schedule.fullName || ''}</td>
            <td>${schedule.email || ''}</td>
            <td>
                <button class="schedule-edit-btn" onclick="editSchedule(${index})">Sửa</button>
                <button class="schedule-delete-btn" onclick="deleteSchedule(${index})">Xóa</button>
            </td>
        `;
        scheduleList.appendChild(row);   // Thêm hàng <tr> vào bảng lịch
    });
}
// Hàm xử lý bộ lọc
function applyFilter() {
    const filterClass = document.getElementById('filter-class').value.toLowerCase();// Lấy giá trị lớp học từ bộ lọc và chuyển thành chữ thường
    const filterEmail = document.getElementById('filter-email').value.trim().toLowerCase();// Lấy giá trị email từ bộ lọc, loại bỏ khoảng trắng và chuyển thành chữ thường
    const filterDate = document.getElementById('filter-date').value;// Lấy giá trị ngày từ bộ lọc
    const schedules = JSON.parse(localStorage.getItem('schedules')) || []; 
    const filteredSchedules = schedules.filter(schedule => {
        const matchesClass = !filterClass || schedule.classType.toLowerCase() === filterClass;// Kiểm tra lớp học: nếu không có bộ lọc hoặc lớp học khớp
        const matchesEmail = !filterEmail || schedule.email.toLowerCase().includes(filterEmail);
        const matchesDate = !filterDate || schedule.date === filterDate; // Kiểm tra ngày: nếu không có bộ lọc hoặc ngày khớp
        return matchesClass && matchesEmail && matchesDate; // Trả về true nếu lịch thỏa mãn tất cả các tiêu chí
    });

    renderSchedules(filteredSchedules); // Hiển thị danh sách lịch đã lọc
}
// Hàm sửa lịch
function editSchedule(index) {
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const schedule = schedules[index];
    const modal = document.getElementById('schedule-modal');
    const modalTitle = document.getElementById('modal-title');
    const fullNameInput = document.getElementById('full-name');
    const classTypeInput = document.getElementById('class-type');
    const dateInput = document.getElementById('schedule-date');
    const timeSlotInput = document.getElementById('time-slot');
    modalTitle.textContent = 'Sửa lịch tập';  // Đặt tiêu đề modal là "Sửa lịch tập"
    fullNameInput.value = schedule.fullName || '';
    renderClassTypes(); // Cập nhật danh sách lớp học
    classTypeInput.value = schedule.classType || '';
    dateInput.value = schedule.date || '';
    timeSlotInput.value = schedule.timeSlot || '';
    window.currentEditIndex = index; // Sử dụng biến khác để tránh xung đột
    modal.style.display = 'block';
}
// Hàm xóa lịch
function deleteSchedule(index) {
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const deleteModal = document.getElementById('delete-modal');
    window.currentDeleteIndex = index; // Sử dụng biến khác để tránh xung đột
    deleteModal.style.display = 'block';
}
// Hàm lưu lịch
function saveSchedule() {
    const fullName = document.getElementById('full-name').value.trim();
    const classType = document.getElementById('class-type').value;
    const date = document.getElementById('schedule-date').value;
    const timeSlot = document.getElementById('time-slot').value;
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const modal = document.getElementById('schedule-modal');
    let hasError = false;
    clearErrors();
    if (!fullName) {
        displayError('full-name-error', 'Vui lòng nhập họ tên');
        hasError = true;
    }
    if (!classType) {
        displayError('class-type-error', 'Vui lòng chọn lớp học');
        hasError = true;
    }
    if (!date) {
        displayError('schedule-date-error', 'Vui lòng chọn ngày tập');
        hasError = true;
    }
    if (!timeSlot) {
        displayError('time-slot-error', 'Vui lòng chọn khung giờ');
        hasError = true;
    }

    // Kiểm tra trùng lặp lịch (không xét email, vì admin có quyền sửa lịch của bất kỳ ai)
    const duplicate = schedules.some((schedule, idx) => 
        schedule.date === date && 
        schedule.timeSlot === timeSlot && 
        idx !== window.currentEditIndex
    );
    if (duplicate) {
        displayError('time-slot-error', 'Lịch tập đã tồn tại cho khung giờ này');
        hasError = true;
    }
    if (!hasError) {
        const schedule = {
            fullName,
            classType,
            date,
            timeSlot,
            email: schedules[window.currentEditIndex]?.email || '' // Giữ email của người dùng cũ
        };
        if (window.currentEditIndex === -1) {
            schedules.push(schedule);
        } else {
            schedules[window.currentEditIndex] = schedule;
        }

        localStorage.setItem('schedules', JSON.stringify(schedules));
        renderSchedules();
        modal.style.display = 'none';
    }
}
// Hàm xác nhận xóa
function confirmDelete() {
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const deleteModal = document.getElementById('delete-modal');
    schedules.splice(window.currentDeleteIndex, 1);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    renderSchedules();
    deleteModal.style.display = 'none';
}
// Hàm hiển thị lỗi
function displayError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    errorElement.innerHTML = message;
    errorElement.style.display = 'block';
}
// Hàm xóa lỗi
function clearErrors() {
    const errors = ['full-name-error', 'class-type-error', 'schedule-date-error', 'time-slot-error'];
    errors.forEach(id => {
        const errorElement = document.getElementById(id);
        errorElement.innerHTML = '';
        errorElement.style.display = 'none';
    });
}
// Khởi tạo trang khi tải
document.addEventListener('DOMContentLoaded', () => {
    renderClassTypes(); // Khởi tạo danh sách lớp học
    renderSchedules();
    document.getElementById('apply-filter').addEventListener('click', applyFilter);
    // Modal Thêm/Sửa lịch
    const closeModal = document.getElementById('schedule-modal')?.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    window.currentEditIndex = -1;
    if (closeModal && cancelBtn && saveBtn) {
        closeModal.onclick = () => {
            document.getElementById('schedule-modal').style.display = 'none';
        };
        cancelBtn.onclick = () => {
            document.getElementById('schedule-modal').style.display = 'none';
        };
        document.getElementById('schedule-modal').onclick = (event) => {
            if (event.target === document.getElementById('schedule-modal')) {
                document.getElementById('schedule-modal').style.display = 'none';
            }
        };
        saveBtn.onclick = saveSchedule;
    }
    // Modal Xóa lịch
    const deleteModal = document.getElementById('delete-modal');
    const closeDeleteModal = deleteModal?.querySelector('.close');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    window.currentDeleteIndex = -1;
    if (closeDeleteModal && cancelDeleteBtn && confirmDeleteBtn) {
        closeDeleteModal.onclick = () => {
            deleteModal.style.display = 'none';
        };
        cancelDeleteBtn.onclick = () => {
            deleteModal.style.display = 'none';
        };
        deleteModal.onclick = (event) => {
            if (event.target === deleteModal) {
                deleteModal.style.display = 'none';
            }
        };
        confirmDeleteBtn.onclick = confirmDelete;
    }
});