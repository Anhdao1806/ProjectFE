// Hàm logout
function logout() {
    localStorage.removeItem('loggedInUser');
    location.href = '../../pages/auth/login.html';
}

// Hàm hiển thị danh sách dịch vụ
function renderServices() {
    let services = JSON.parse(localStorage.getItem('services')) || [];
    // // Nếu localStorage chưa có dữ liệu, thêm dữ liệu mẫu
    // if (services.length === 0) {
    //     services = [
    //         { name: "Gym", description: "Tập luyện với các thiết bị hiện đại", image: "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1200" },
    //         { name: "Yoga", description: "Thư giãn và cân bằng tâm trí", image: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=1200" },
    //         { name: "Zumba", description: "Đốt cháy calories với nhịp điệu sôi động", image: "https://images.pexels.com/photos/4807082/pexels-photo-4807082.jpeg?auto=compress&cs=tinysrgb&w=1200" }
    //     ];
    //     localStorage.setItem('services', JSON.stringify(services));
    // }
    const serviceList = document.getElementById('service-list');
    serviceList.innerHTML = '';
    services.forEach((service, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${service.name || ''}</td>
            <td>${service.description || ''}</td>
            <td><img src="${service.image || ''}" alt="${service.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;"></td>
            <td>
                <button class="edit-btn" onclick="editService(${index})">Sửa</button>
                <button class="delete-btn" onclick="deleteService(${index})">Xóa</button>
            </td>
        `;
        serviceList.appendChild(row);
    });
}

// Hàm mở modal để thêm/sửa dịch vụ
function openModal(isEdit = false, index = -1) {
    const modal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-title');
    const serviceName = document.getElementById('service-name');
    const serviceDescription = document.getElementById('service-description');
    const serviceImage = document.getElementById('service-image');
    clearErrors();

    if (isEdit) {
        const services = JSON.parse(localStorage.getItem('services')) || [];
        const service = services[index];
        modalTitle.textContent = 'Sửa Dịch vụ';
        serviceName.value = service.name || '';
        serviceDescription.value = service.description || '';
        serviceImage.value = service.image || '';
        window.editIndex = index;
    } else {
        modalTitle.textContent = 'Thêm Dịch vụ mới';
        serviceName.value = '';
        serviceDescription.value = '';
        serviceImage.value = '';
        window.editIndex = -1;
    }
    modal.style.display = 'block';
}

// Hàm lưu dịch vụ
function saveService() {
    const serviceName = document.getElementById('service-name').value.trim();
    const serviceDescription = document.getElementById('service-description').value.trim();
    const serviceImage = document.getElementById('service-image').value.trim();
    const services = JSON.parse(localStorage.getItem('services')) || [];
    const modal = document.getElementById('service-modal');

    // Validate
    let hasError = false;
    clearErrors();

    if (!serviceName) {
        displayError('service-name-error', 'Vui lòng nhập tên dịch vụ');
        hasError = true;
    }
    if (!serviceDescription) {
        displayError('service-description-error', 'Vui lòng nhập mô tả');
        hasError = true;
    }
    if (!serviceImage) {
        displayError('service-image-error', 'Vui lòng nhập URL hình ảnh');
        hasError = true;
    } else {
        const img = new Image();
        img.onerror = () => {
            displayError('service-image-error', 'URL hình ảnh không hợp lệ');
            hasError = true;
        };
        img.src = serviceImage;
    }

    if (!hasError) {
        const service = {
            name: serviceName,
            description: serviceDescription,
            image: serviceImage
        };

        if (window.editIndex === -1) {
            services.push(service);
        } else {
            services[window.editIndex] = service;
        }

        localStorage.setItem('services', JSON.stringify(services));
        renderServices();
        modal.style.display = 'none';
    }
}

// Hàm sửa dịch vụ
function editService(index) {
    openModal(true, index);
}

// Hàm xóa dịch vụ
function deleteService(index) {
    const deleteModal = document.getElementById('delete-modal');
    window.deleteIndex = index;
    deleteModal.style.display = 'block';
}

// Hàm xác nhận xóa
function confirmDelete() {
    const services = JSON.parse(localStorage.getItem('services')) || [];
    const deleteModal = document.getElementById('delete-modal');
    services.splice(window.deleteIndex, 1);
    localStorage.setItem('services', JSON.stringify(services));
    renderServices();
    deleteModal.style.display = 'none';
}

// Hàm hiển thị lỗi
function displayError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Hàm xóa lỗi
function clearErrors() {
    const errors = ['service-name-error', 'service-description-error', 'service-image-error'];
    errors.forEach(id => {
        const errorElement = document.getElementById(id);
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    });
}

// Khởi tạo trang khi tải
document.addEventListener('DOMContentLoaded', () => {
    renderServices();

    // Modal Thêm/Sửa
    const addServiceBtn = document.getElementById('add-service-btn');
    const closeModal = document.getElementById('service-modal').querySelector('.close');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');

    if (addServiceBtn && closeModal && cancelBtn && saveBtn) {
        addServiceBtn.onclick = () => openModal();
        closeModal.onclick = cancelBtn.onclick = () => {
            document.getElementById('service-modal').style.display = 'none';
        };
        document.getElementById('service-modal').addEventListener('click', (event) => {
            if (event.target === document.getElementById('service-modal')) {
                document.getElementById('service-modal').style.display = 'none';
            }
        });
        saveBtn.onclick = saveService;
    }

    // Modal Xóa
    const deleteModal = document.getElementById('delete-modal');
    const closeDeleteModal = deleteModal.querySelector('.close');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

    if (closeDeleteModal && cancelDeleteBtn && confirmDeleteBtn) {
        closeDeleteModal.onclick = cancelDeleteBtn.onclick = () => {
            deleteModal.style.display = 'none';
        };
        deleteModal.addEventListener('click', (event) => {
            if (event.target === deleteModal) {
                deleteModal.style.display = 'none';
            }
        });
        confirmDeleteBtn.onclick = confirmDelete;
    }
});