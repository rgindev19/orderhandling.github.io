const tableBody = document.querySelector('#itemTable tbody');

// Load saved items from localStorage
window.onload = function () {

    const savedItems = JSON.parse(localStorage.getItem('items')) || [];
    const companySet = new Set();

      // sort items by delivery date
savedItems.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));


    savedItems.forEach(item => {
        displayItem(item);
        if (item.companyName) {
            companySet.add(item.companyName);
        }
    });

    const companyFilter = document.getElementById('companyFilter');
    companySet.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        companyFilter.appendChild(option);
    });
};


function addItem() {
    const name = document.getElementById('itemName').value;
    const pdfFile = document.getElementById('drawingImage').files[0]; // PDF file is optional
    const quantity = document.getElementById('quantity').value;
    const companyName = document.getElementById('companyName').value;
    const deliveryDate = document.getElementById('deliveryDate').value;

    if (!name || !quantity || !companyName ||!deliveryDate) return alert('Please fill all required fields.');

    let pdfUrl = null;  // Initialize the PDF URL as null
    if (pdfFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            pdfUrl = e.target.result;  // Set the URL if the PDF is provided
            const newItem = {
                name,
                pdfUrl,
                quantity,
                companyName,
                deliveryDate,
                status: getStatus(deliveryDate)
            };            
            saveItemToLocalStorage(newItem);
            displayItem(newItem);
        };
        reader.readAsDataURL(pdfFile);  // Read the PDF file as base64
    } else {
        // If no PDF is selected, save the item without a PDF URL
        const newItem = {
            name,
            pdfUrl,  // No PDF URL
            quantity,
            companyName,
            deliveryDate,
            status: getStatus(deliveryDate)
        };
        saveItemToLocalStorage(newItem);
        displayItem(newItem);
    }
}

function getStatus(deliveryDate) {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'DELAYED';
    else if (diffDays <= 2) return 'FOR DELIVERY';
    else return 'PENDING';
}

function saveItemToLocalStorage(item) {
    const savedItems = JSON.parse(localStorage.getItem('items')) || [];
    savedItems.push(item);
    localStorage.setItem('items', JSON.stringify(savedItems));
}

function displayItem(item) {
    const row = document.createElement('tr');
    row.innerHTML = `
    <td>${item.name}</td>
    <td>${item.pdfUrl ? `<a href="${item.pdfUrl}" target="_blank">View Drawing (PDF)</a>` : 'No Drawing Provided'}</td>
    <td>${item.quantity}</td>
    <td>${item.companyName || 'N/A'}</td> <!-- NEW -->
    <td>${item.deliveryDate}</td>
    <td>${item.status}</td>
    <td><span class="edit-button" onclick="editItem(event)">Edit</span></td>
    <td><span class="delete-button" onclick="deleteItem(event)">Delete</span></td>
`;

    if (item.status === 'DELAYED') {
        row.classList.add('delayed', 'blinking-background');
    } else if (item.status === 'FOR DELIVERY') {
        row.classList.add('for-delivery');
    }    
    

    tableBody.appendChild(row);
}

function editItem(event) {
    const row = event.target.closest('tr');
    const name = row.cells[0].innerText;
    const pdfUrl = row.cells[1].querySelector('a') ? row.cells[1].querySelector('a').href : null; // Check if the link exists
    const quantity = row.cells[2].innerText;
    const companyName = row.cells[3].innerText; // Adjust index if needed
    const deliveryDate = row.cells[3].innerText;

    // Fill form with existing values
    document.getElementById('itemName').value = name;
    document.getElementById('drawingImage').value = ''; // Can't set image value
    document.getElementById('quantity').value = quantity;
    document.getElementById('companyName').value = companyName;
    document.getElementById('deliveryDate').value = deliveryDate;

    // Remove item from localStorage before editing
    deleteItem(event);
}

function deleteItem(event) {
    const row = event.target.closest('tr');
    const name = row.cells[0].innerText;
    const savedItems = JSON.parse(localStorage.getItem('items')) || [];
    const updatedItems = savedItems.filter(item => item.name !== name);
    localStorage.setItem('items', JSON.stringify(updatedItems));

    row.remove();
}

// Request notification permission
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

function printTable() {
    const printWindow = window.open('', '', 'width=800,height=600');
    const table = document.getElementById('itemTable').outerHTML;

    printWindow.document.write(`
        <html>
            <head>
                <title>Print Items</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h2>Order Handling Items</h2>
                ${table}
                <script>window.onload = function() { window.print(); }</script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

function filterByCompany() {
    const filterValue = document.getElementById('companyFilter').value;
    const table = document.getElementById('itemTable');
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const company = row.cells[3].innerText;
        if (filterValue === 'all' || company === filterValue) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
