const grid = document.getElementById("grid-container");
const api_category = "http://localhost:3000/api/category"

grid.innerHTML = 
`
            <div class="grid-item" data-id="sejarah">
                <img src="frontend/image/1.jpg" alt="">
                <h3></h3>
            </div>
            <div class="grid-item" data-id="">
                <img src="frontend/image/1.jpg" alt="">
                <h3></h3>
            </div>
            <div class="grid-item" data-id="${item.id}">
                <img src="frontend/image/1.jpg" alt="">
                <h3></h3>
            </div>
            <div class="grid-item" data-id="${item.id}">
                <img src="frontend/image/1.jpg" alt="">
                <h3></h3>
            </div>
            <div class="grid-item" data-id="${item.id}">
                <img src="frontend/image/1.jpg" alt="">
                <h3></h3>
            </div>
`