const apiUrl = 'https://jsonplaceholder.typicode.com';
const albumSelect = document.getElementById('albumSelect');
const statusMsg = document.getElementById('statusMsg');
const albumContent = document.getElementById('albumContent');
const authorBlock = document.getElementById('authorBlock');
const photosGrid = document.getElementById('photosGrid');

let albumsData = [];

async function loadAlbums() {
    statusMsg.textContent = 'Загрузка...';
    statusMsg.style.color = 'black';
    
    try {
        const response = await fetch(`${apiUrl}/albums`);
        if (!response.ok) throw new Error(`Код ошибки: ${response.status}`);
        
        albumsData = await response.json();
        albumSelect.innerHTML = '<option value="">-- Выберите альбом --</option>';
        
        for (let album of albumsData) {
            const option = document.createElement('option');
            option.value = album.id;
            option.textContent = album.title;
            albumSelect.appendChild(option);
        }
        statusMsg.textContent = '';
    } catch (err) {
        statusMsg.textContent = `Не удалось загрузить данные: ${err.message}`;
        statusMsg.style.color = 'red';
        albumSelect.innerHTML = '<option value="">Ошибка</option>';
    }
}

albumSelect.addEventListener('change', async (event) => {
    const selectedId = event.target.value;
    
    authorBlock.innerHTML = '';
    photosGrid.innerHTML = '';
    
    if (!selectedId) {
        albumContent.classList.add('hidden');
        return;
    }
    
    albumContent.classList.remove('hidden');
    statusMsg.textContent = 'Загрузка информации';
    statusMsg.style.color = 'black';
    
    const currentAlbum = albumsData.find(item => item.id === Number(selectedId));
    
    try {
        const [userRes, photosRes] = await Promise.all([
            fetch(`${apiUrl}/users/${currentAlbum.userId}`),
            fetch(`${apiUrl}/photos?albumId=${currentAlbum.id}`)
        ]);
        
        if (!userRes.ok || !photosRes.ok) {
            throw new Error('Ошибка при получении данных с сервера');
        }
        
        const user = await userRes.json();
        const photos = await photosRes.json();
        
        authorBlock.innerHTML = `
            <h4>Автор: ${user.name}</h4>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Всего фото:</strong> ${photos.length}</p>
        `;
        
        let htmlContent = '';
        for (let photo of photos) {
            htmlContent += `
                <div class="photo-item">
                    <a href="${photo.url}" target="_blank" rel="noopener noreferrer">
                        <img src="${photo.thumbnailUrl}" alt="${photo.title}">
                    </a>
                    <div class="photo-caption" title="${photo.title}">${photo.title}</div>
                </div>
            `;
        }
        
        photosGrid.innerHTML = htmlContent;
        statusMsg.textContent = '';
        
    } catch (err) {
        statusMsg.textContent = `Ошибка: ${err.message}`;
        statusMsg.style.color = 'red';
    }
});

window.addEventListener('DOMContentLoaded', loadAlbums);