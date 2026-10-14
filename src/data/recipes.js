import creamyGarlicChicken from "../assets/images/creamy-garlic-chicken.jpg";
import jollofRice from "../assets/images/jollof-rice.jpg";
import chickenAlfredo from "../assets/images/chicken-alfredo.jpg";
import vegetableSalad from "../assets/images/vegetable-salad.jpg";
const recipes = [
  {
    id: 1,
    title: "Nigerian Jollof Rice",
    category: "Rice",
    image: jollofRice,
    rating: 4.8,
    difficulty: "Easy",
    time: "45 mins",
    calories: 410,
    description: "Classic West African rich, smoky, and deeply flavorful tomato-based rice dish.",
    ingredients:[
      "3 cups Parboiled Long-Grain Rice",
      "5 Large Tomatoes",
      "3 Red Bell Peppers (Tatashe)",
      "2 Scotch Bonnet Peppers",
      "2 Large Onions",
      "1/4 cup Tomatoe Paste",
      "2 Chicken Stock",
      "1/4 cup  Vegetable Oil",
      "1 tbsp Curry Powder & Thyme",
      "3 Bay Leaves"
    ],
    instructions:[
      "Blend tomatoes, bell peppers, scotch bonnets, and one onion until smooth.",
      "Heat vegetable oil and fry the second sliced onion until translucent.",
      "Add tomatoe paste, fry for 5 minutes, then add the blended pepper mix.",
      "Cook down the sauce until the oil separates from the tomatoe mix.",
      "Stir in the chicken stock, curry, thyme, bay leaves, and bring to a boil.",
      "Rinse rice thoroughly, add it to the pot, cover tightly, and cook on low heat until tender."
    ],
    nutrition:{
      calories:"410 kcal",
      protein:"12g",
      carbs:"68g",
      fat:"9g"
    }
  },
  {
    id: 2,
    title: "Classic Chicken Alfredo",
    image: chickenAlfredo,
    category:"Pasta",
    rating: 4.7,
    difficulty: "Medium",
    time: "30 mins",
    calories: 680,
    description:"Rich and comforting fettuccine tossed in a velvety, homemade garlic-parmesan cream sauce.",
    ingredients:[
      "300g Fettuccine Pasta",
      "2 Large Chicken Breasts (Sliced)",
      "1 cup Heavy Cream",
      "1/2 cup Grated Parmesan Cheese",
      "4 Garlic Cloves (Minced)",
      "2 tbsp Butter",
      "1 tbsp Olive Oil",
      "Fresh Parsley for garnish"
    ],
    instructions:[
      "Cook fettuccine in a pot of salted boiling water according to package directions.",
      "Season chicken with salt and pepper, then sear in olive oil  until golden and cooked through.",
      "Remove chicken, lower heat, melt butter in the same pan, and saute garlic until fragrant.",
      "pour in heavy cream and simmer gently for 5 minutes.",
      "Stir in parmesan cheese until smooth, then toss in cooked pasta and sliced chicken.",
      "Garnish with chopped fresh parsley and serve hot."
    ],
    nutrition:{
      calories: "680 kcal",
      protein: "42",
      carbs:"54",
      fat:"32"
    }
  },
  {
    id: 3,
    title: "Mediterranean Vegetable Salad",
    image: vegetableSalad ,
    category:"Salad",
    rating: 4.6,
    difficulty: "Easy",
    time: "15 mins",
    calories:190,
    description:"A crisp, colorful, and refreshing medley of garden vegetables tossed in a tangy vinaigrette.",
    ingredients:[
      "1 English Cucumber (Sliced)",
      "2 cups Cherry Tomatoes (Halved)",
      "1 cup Feta Cheese (Crumbled)",
      "1/2 cup Kalamata Olives",
      "1/2 Red Onion(Thinly Sliced)",
      "1 Bell Pepper (Chopped)",
      "3 tbsp Extra Virgin Olive Oil",
      "1 tbsp Lemon Juice",
      "1 tsp Dried Oregano"
    ],
    instructions:[
      "Wash and chop the cucumber, tomatoes, red onion,  and bell pepper.",
      "Combine all the chopped vegetables in a large salad bowl.",
      "Add the kalamata olives and crumbled feta cheese to the bowl.",
      "In a small jar, whisk together olive oil, lemon juice, and dried oregano.",
      "Drizzle the dressing over the salad and toss gently to combine.",
      "Serve chilled as a healthy side or light main dish."
    ],
    nutrition:{
      calories:"190 kcal",
      protein: "5g",
      carbs: "11g",
      fat: "14g"
    }
  },
  {
  id: 4,
  title: "Creamy Garlic Chicken Pasta",

  image:creamyGarlicChicken,

  category: "Chicken",

  rating: 4.9,

  difficulty: "Easy",

  time: "25 mins",

  calories: 520,

  description:
    "Creamy garlic chicken pasta with parmesan and herbs.",

  ingredients: [
    "250g Pasta",
    "2 Chicken Breasts",
    "3 Garlic Cloves",
    "1 Cup Cream",
    "Parmesan Cheese",
    "Butter"
  ],

  instructions: [
    "Boil the pasta.",
    "Cook the chicken.",
    "Prepare the sauce.",
    "Mix everything together.",
    "Serve while hot."
  ],

  nutrition: {
    calories: "520 kcal",
    protein: "35g",
    carbs: "45g",
    fat: "20g"
  }
}
];

export default recipes;