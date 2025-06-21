// app.js
let model;
const imgInput = document.getElementById('img-upload');
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
const detectBtn = document.getElementById('detect-btn');
const recipesDiv = document.getElementById('recipes');

// 1️⃣ Load model on start
cocoSsd.load().then(m => {
  model = m;
  detectBtn.disabled = false;
});

imgInput.addEventListener('change', async () => {
  const file = imgInput.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);

  if (file.size < 1240*60){
    detectBtn.style.cursor = "none"
    detectBtn.style.background = 'grey'
    detectBtn.innerText = "File min. size = 60KB"
    detectBtn.disabled = true;
  }

  else{

    detectBtn.disabled = false;
    detectBtn.style.backgroundColor = '#0000FF'
    detectBtn.style.cursor = 'pointer'
    detectBtn.innerText = "Recipe.."
  }



  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
});

detectBtn.addEventListener('click', async () => {

  recipesDiv.innerHTML = 'Detecting…';
  const predictions = await model.detect(canvas);
  // 2️⃣ Filter for food items
  const foods = predictions
    .filter(p => ['banana','apple','bottle','cup','orange','sandwich','pizza' , 'brinjal' , 'bottle guard' , 'milk' , 'cheese' , 'carrot' , 'watermelon'].includes(p.class))
    .map(p => p.class);
  const topIngredients = [...new Set(foods)].slice(0, 5);
  if (!topIngredients.length) {
    recipesDiv.innerHTML = '<p>No ingredients found. Try a clearer shot!</p>';
    return;
  }
  fetchRecipes(topIngredients);
});

async function fetchRecipes(ingredients) {
  const key = 'cbf789fb41424b4f92ac32c3fd9b3ff3'; 
  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients.join(',')}&number=5&apiKey=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  renderRecipes(data);
}

function renderRecipes(list) {
  recipesDiv.innerHTML = '';
  list.forEach(r => {
    const card = document.createElement('div');
    card.className = 'border rounded p-4 bg-white';
    card.innerHTML = `
      <img src="${r.image}" class="w-full h-32 object-cover rounded mb-2" />
      <h2 class="font-semibold">${r.title}</h2>
      <p>Uses: ${r.usedIngredientCount} / ${r.missedIngredientCount} ingredients</p>
      <a href="https://spoonacular.com/recipes/${encodeURI(r.title)}-${r.id}" target="_blank" class="text-blue-600 underline">Full recipe →</a>
    `;
    recipesDiv.appendChild(card);
  });
}
