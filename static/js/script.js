const ALLOWED_FILE_EXTENSIONS = ['text/csv', 'application/json', 'text/xml']

window.onload = () => {
    displayUplaodedFiles()
    displayCleanedFiles()
}

document.querySelector('#input-file').addEventListener('change', handleFilesChange)

document.querySelector('.form').addEventListener('submit', async (e) => {
    e.preventDefault()

    const form = e.target;
    const formData = new FormData(form)
    const files = JSON.parse(localStorage.getItem('uploaded-files')) || []
    try{
        const response = await fetch("/upload", {
            method: "POST",
            body:  formData
        })
        const data = await response.json()

        data.message && handleToast(data)
        data.file && handleCleanedFile(data.file)

    }catch(error){
        console.log('error')
    }
})

function handleFilesChange (e) {
    const newFiles = JSON.parse(localStorage.getItem('uploaded-files')) || []
    if (e.target.files) {
        for (const file of e.target.files) {
            if (ALLOWED_FILE_EXTENSIONS.includes(file.type)) {
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = (e) => {
                    if (e.target?.result) {
                        newFiles.push({
                            id: Date.now(),
                            name: file.name,
                            previewUrl: e.target.result,
                            size: file.size,
                            type: file.type
                        })
                        localStorage.setItem('uploaded-files', JSON.stringify(newFiles))
                        displayUplaodedFiles()
                    }
                }
            } else {
                alert("Format de fichier non accepté ou fichier trop gros.");
            }
        }
    }
};

const handleToast = (data) => {
    const messages = document.querySelector('.flashes')
    const toast = document.createElement('li')
    toast.innerHTML = `
            <strong style='font-size:12px;'>${messages.children.length + 1}</strong>
            <p>${data.message}</p>
            <button class=close-btn-${messages.children.length + 1}>X</button>
        `

    toast.classList.add( data.success === true ? 'success' : 'error' )

    messages.appendChild(toast)

    toast.querySelector('button').addEventListener('click', (e) => toast.remove())
    setTimeout(() => toast.remove(), "5000");
}

const handleCleanedFile = (file) => {
    const files = JSON.parse(localStorage.getItem('cleaned-files')) || []
    files.push({
        id: Date.now(),
        path: file
    })
    localStorage.setItem('cleaned-files', JSON.stringify(files))

    displayCleanedFiles()
}

const displayUplaodedFiles = () => {
    document.querySelector('.uploaded-files').replaceChildren('')

    const files = JSON.parse(localStorage.getItem('uploaded-files')) || []
    files.length > 0 && files.map(file => {
        const fileItem = document.createElement('tr')
        fileItem.innerHTML = `
            <td>${file.name.split('.')[0]}</td>
            <td>${file.name.split('.')[1]}</td>
            <td><button class='delete-btn'>Delete</button></td>
        `
        fileItem.querySelector('button').addEventListener('click',(e) => {
            const filteredItems = files.filter(item => item.id != file.id )
            handleToast({success:true, message:'File deleted succesfully'})
            localStorage.setItem('uploaded-files', JSON.stringify(filteredItems))
            displayUplaodedFiles()
        })

        document.querySelector('.uploaded-files').appendChild(fileItem)
        document.querySelector('.uploaded-files-wrapper').classList.add('show')
    })
}
const displayCleanedFiles = () => {
    document.querySelector('.cleaned-files').replaceChildren('')

    const files = JSON.parse(localStorage.getItem('cleaned-files')) || []
    files.length > 0 && files.map(file => {
        const cleaned_file = document.createElement('tr')
        const name = file.path.split('\\')[file.path.split('\\').length - 1].split('.')[0]
        const type = file.path.split('\\')[file.path.split('\\').length - 1].split('.')[1]
        cleaned_file.innerHTML = `
                <td>${name}</td>
                <td>${type}</td>
                <td>
                    <div>
                    <a class='download-btn' href="${file.path}" download="${name}">Download</a>
                    <button class='delete-btn'>Delete</button>
                    </div>
                </td>

            `
        cleaned_file.querySelector('button').addEventListener('click',(e) => {
            const filteredItems = files.filter(item => item.id != file.id )
            localStorage.setItem('cleaned-files', JSON.stringify(filteredItems))
            displayCleanedFiles()
        })
        document.querySelector('.cleaned-files').appendChild(cleaned_file)
        document.querySelector('.cleaned-files-container').classList.add('show')

    })
}
