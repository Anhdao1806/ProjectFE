// Khởi tạo dữ liệu mẫu nếu chưa có
let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
localStorage.setItem('schedules', JSON.stringify(schedules));

// Lấy thông tin người dùng đã đăng nhập
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const greeting = document.getElementById('greeting');
if (loggedInUser) {
    const username = loggedInUser.email.split('@')[0];
    greeting.textContent = `Xin chào, ${username}`;
    greeting.style.color = '#FFD700';
    greeting.style.fontWeight = 'bold';
    greeting.style.fontSize = '16px';
} else {
    greeting.textContent = 'Vui lòng đăng nhập để xem lịch tập';
    greeting.style.color = 'red';
}

// Hiển thị danh sách lịch
function renderSchedules() {
    const scheduleList = document.getElementById('schedule-list');
    scheduleList.innerHTML = '';
    if (!loggedInUser) {
        scheduleList.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Vui lòng đăng nhập để xem lịch tập</td></tr>';
        return;
    }
    const userSchedules = schedules.filter(schedule => schedule.email === loggedInUser.email);
    userSchedules.forEach((schedule, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${schedule.classType}</td>
            <td>${schedule.date}</td>
            <td>${schedule.timeSlot}</td>
            <td>${schedule.fullName}</td>
            <td>${schedule.email}</td>
            <td>
                <button onclick="editSchedule(${index})">Sửa</button>
                <button onclick="deleteSchedule(${index})">Xóa</button>
            </td>
            <td>${schedule.status || "Chờ duyệt"}</td>
        `;
        scheduleList.appendChild(row);
    });
}

// Modal Thêm/Sửa lịch
const modal = document.getElementById('schedule-modal');
const addScheduleBtn = document.getElementById('add-schedule-btn');
const addScheduleLink = document.getElementById('add-schedule-link');
const closeModal = modal.querySelector('.close');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
let editIndex = -1;

addScheduleBtn.onclick = addScheduleLink.onclick = () => {
    if (!loggedInUser) {
        alert('Vui lòng đăng nhập để đặt lịch');
        return;
    }
    document.getElementById('modal-title').textContent = 'Đặt lịch mới';
    document.getElementById('full-name').value = '';
    document.getElementById('class-type').value = '';
    document.getElementById('schedule-date').value = '';
    document.getElementById('time-slot').value = '';
    clearErrors();
    editIndex = -1;
    modal.style.display = 'block';
};

closeModal.onclick = cancelBtn.onclick = () => {
    modal.style.display = 'none';
};

// Thay thế window.onclick bằng addEventListener
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

saveBtn.onclick = () => {
    const fullName = document.getElementById('full-name').value.trim();
    const classType = document.getElementById('class-type').value;
    const date = document.getElementById('schedule-date').value;
    const timeSlot = document.getElementById('time-slot').value;

    // Validate
    clearErrors();
    let hasError = false;

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

    // Kiểm tra trùng lặp
    const duplicate = schedules.some((schedule, idx) => 
        schedule.email === loggedInUser.email && 
        schedule.date === date && 
        schedule.timeSlot === timeSlot && 
        idx !== editIndex
    );
    if (duplicate) {
        displayError('time-slot-error', 'Lịch tập đã tồn tại cho khung giờ này');
        hasError = true;
    }

    if (!hasError) {
        const schedule = {
            fullName, // Lưu họ tên người dùng nhập
            classType,
            date,
            timeSlot,
            email: loggedInUser.email,
            status: "Chờ duyệt" // Giữ trạng thái mặc định
        };

        if (editIndex === -1) {
            schedules.push(schedule);
        } else {
            schedules[editIndex] = schedule;
        }

        localStorage.setItem('schedules', JSON.stringify(schedules));
        renderSchedules();
        modal.style.display = 'none';
    }
};

// Modal Xóa lịch
const deleteModal = document.getElementById('delete-modal');
const closeDeleteModal = deleteModal.querySelector('.close');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
let deleteIndex = -1;

closeDeleteModal.onclick = cancelDeleteBtn.onclick = () => {
    deleteModal.style.display = 'none';
};

// Thay thế window.onclick bằng addEventListener
deleteModal.addEventListener('click', (event) => {
    if (event.target === deleteModal) {
        deleteModal.style.display = 'none';
    }
});

function editSchedule(index) {
    const schedule = schedules[index];
    document.getElementById('modal-title').textContent = 'Sửa lịch tập';
    document.getElementById('full-name').value = schedule.fullName;
    document.getElementById('class-type').value = schedule.classType;
    document.getElementById('schedule-date').value = schedule.date;
    document.getElementById('time-slot').value = schedule.timeSlot;
    editIndex = index;
    modal.style.display = 'block';
}

function deleteSchedule(index) {
    deleteIndex = index;
    deleteModal.style.display = 'block';
}

confirmDeleteBtn.onclick = () => {
    schedules.splice(deleteIndex, 1);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    renderSchedules();
    deleteModal.style.display = 'none';
};

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

// Hiển thị danh sách lịch khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    renderSchedules();
});