// Read JSON-File from Server
let recipesJSON;
let xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    recipesJSON = JSON.parse(this.responseText);
  }
};
xmlhttp.open(
  "GET",
  "https://rawgit.com/crelder/recipe-shoppinglist-generator/master/recipes.json",
  false
);
xmlhttp.send();

// Random order of recipes
const recipeCollection = recipesJSON.sort(function() {
  return 0.5 - Math.random();
});

function createUniqueIngredients(recipes) {
  const ings = {};

  for (var recipeName in recipes) {
    for (var ingredientName in recipes[recipeName].ingredients) {
      if (!ings.hasOwnProperty(ingredientName)) {
        ings[ingredientName] = {
          unit: recipes[recipeName].ingredients[ingredientName].unit,
          amount: recipes[recipeName].ingredients[ingredientName].amount,
          department: recipes[recipeName].ingredients[ingredientName].department
        };
      } else {
        ings[ingredientName].amount =
          ings[ingredientName].amount +
          recipes[recipeName].ingredients[ingredientName].amount;
      }
    }
  }
  return ings;
}

function sortIngredientsByDepartment(ingredients) {
  const lst = Object.keys(ingredients).map(name => ({
    name: name,
    unit: ingredients[name].unit,
    amount: ingredients[name].amount,
    department: ingredients[name].department
  }));
  const sortedByDepartment = lst.sort(
    (l, r) => (l.department <= r.department ? -1 : 1)
  );
  return sortedByDepartment.map(ing => `${ing.amount} ${ing.unit} ${ing.name}`);
}

function createIngredientStringforClipboard(recipes) {
  date = new Date();
  return `Einkaufsliste für den ${date.toLocaleDateString("de-DE", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric"
  })} :\n ${sortIngredientsByDepartment(createUniqueIngredients(recipes)).join(
    "\n"
  )}`;
}

function createMenueStringforClipboard(recipes) {
  date = new Date();

  let menuString = `Menüliste ab dem ${date.toLocaleDateString("de-DE", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric"
  })}:
        ${Object.keys(recipes)
          .join(", ")
          .toUpperCase()}\n\n`;

  for (var recipeName in recipes) {
    menuString +=
      recipeName.toUpperCase() + "\n" + "--------------------" + "\n";
    for (var j = 0; j < recipes[i].ingredients.length; j++) {
      menuString +=
        recipes[i].ingredients[j].amount +
        recipes[i].ingredients[j].unit +
        " " +
        recipes[i].ingredients[j].name +
        "\n";
    }
    menuString += '"' + recipes[i].comment + '"' + "\n\n";
  }
  return menuString;
}

/* --------- VUE component------------*/
Vue.component("my-meal", {
  props: {
    recipe: Object,
    recipename: String,
    selectedrecipes: Array
  },
  data: function() {
    return {
      selected: false
    };
  },
  methods: {
    toggleSelectedRecipe: function() {
      let indexOfRecipe = this.selectedrecipes.indexOf(this.recipename);
      indexOfRecipe == -1
        ? this.selectedrecipes.push(this.recipename)
        : this.selectedrecipes.splice(indexOfRecipe, 1);

      this.selected = !this.selected;
    }
  },
  template:
    '<a href="javascript:void(0);" class="list-group-item list-group-item-action" v-bind:class="{active: selected}" v-on:click="toggleSelectedRecipe"> {{ recipename }}</a>'
});

/* ---------- VUE instance ------------*/
var vm = new Vue({
  el: "#app",
  data: function() {
    return {
      recipes: recipeCollection,
      selectedRecipes: [],
      menuString: ""
    };
  },
  methods: {
    onCopy: function(event) {
      alert(
        "Folgende Liste ist in die Zwischenablage kopiert:\n\n" + event.text
      );
    },
    generateIngredientString() {
      let selectedRecipesFull = {};
      this.selectedRecipes.forEach(
        recipeName =>
          (selectedRecipesFull[recipeName] = this.recipes[recipeName])
      );
      console.log(
        "String: ",
        createIngredientStringforClipboard(selectedRecipesFull)
      );

      return createIngredientStringforClipboard(selectedRecipesFull);
    },
    generateMenuString() {
      this.menuString = createMenueStringforClipboard(this.selectedRecipes);
    }
    // ,
    // onError: function() {
    //   alert("Fehler beim Kopieren in die Zwischenablage.");
    // }
  }
});

//  Füge noch Allgäuer Käsesuppe hinzu mit Schnittlauch, sowie Sauerbraten, Rezept von Stephan (Tomatensalat mit Basilikum mit Nudeln)
