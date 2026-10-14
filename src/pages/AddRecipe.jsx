import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { createRecipe, updateRecipe } from "../services/recipeService";
import { deleteRecipeImage, uploadRecipeImage } from "../services/recipeImageService";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { categories } from "../data/categories";

/*
========================================================
CONVERT IMAGE FILE TO DATA URL
========================================================

Guest recipes are stored in localStorage.

A File object cannot be properly stored in localStorage,
so we convert the selected image into a Base64/data URL.
*/
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("Could not read image file."));
    };

    reader.readAsDataURL(file);
  });
}


function AddRecipe() {

  const { currentUser } = useAuth();

  const { id } = useParams();


  /*
  ========================================================
  BASIC RECIPE INFORMATION
  ========================================================
  */

  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [cookTimeUnit, setCookTimeUnit] = useState("minutes");
  const [servings, setServings] = useState("");
  const [difficulty, setDifficulty] = useState("");


  /*
  ========================================================
  VALIDATION
  ========================================================
  */

  const [errors, setErrors] = useState({});


  /*
  ========================================================
  INGREDIENTS
  ========================================================
  */

  const [ingredients, setIngredients] = useState([""]);
  const [ingredientIds, setIngredientIds] = useState([1]);


  /*
  ========================================================
  STEPS
  ========================================================
  */

  const [steps, setSteps] = useState([""]);
  const [stepIds, setStepIds] = useState([1]);


  /*
  ========================================================
  IMAGE
  ========================================================
  */

  const [image, setImage] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef(null);


  /*
  ========================================================
  LOAD FIRESTORE RECIPE WHEN EDITING
  ========================================================
  */

 useEffect(() => {
  if (!id) {
    return;
  }

  async function loadRecipe() {
    try {
      /*
      ====================================================
      GUEST RECIPE
      ====================================================
      */

      if (!currentUser) {
        const storedRecipes =
          JSON.parse(
            localStorage.getItem("guestRecipes")
          ) || [];

        const guestRecipe =
          storedRecipes.find(
            (recipe) => recipe.id === id
          );

        if (!guestRecipe) {
          toast.error("Recipe not found.");
          return;
        }

        setRecipeName(
          guestRecipe.recipeName || ""
        );

        setDescription(
          guestRecipe.description || ""
        );

        setCategory(
          guestRecipe.category || ""
        );

        setCookTime(
          guestRecipe.cookTime || ""
        );

        setCookTimeUnit(
          guestRecipe.cookTimeUnit || "minutes"
        );

        setServings(
          guestRecipe.servings || ""
        );

        setDifficulty(
          guestRecipe.difficulty || ""
        );

        const loadedIngredients =
          guestRecipe.ingredients || [""];

        setIngredients(loadedIngredients);

        setIngredientIds(
          loadedIngredients.map(
            (_, index) => index + 1
          )
        );

        const loadedSteps =
          guestRecipe.steps || [""];

        setSteps(loadedSteps);

        setStepIds(
          loadedSteps.map(
            (_, index) => index + 1
          )
        );

        setImage(
          guestRecipe.image || null
        );

        return;
      }


      /*
      ====================================================
      FIRESTORE RECIPE
      ====================================================
      */

      const docRef =
        doc(db, "recipes", id);

      const snapshot =
        await getDoc(docRef);

      if (!snapshot.exists()) {
        toast.error("Recipe not found.");
        return;
      }

      const recipe =
        snapshot.data();

      /*
      Make sure the logged-in user
      owns the recipe.
      */

      if (
        recipe.ownerId !==
        currentUser.uid
      ) {
        toast.error(
          "You are not allowed to edit this recipe."
        );

        return;
      }

      setRecipeName(
        recipe.recipeName || ""
      );

      setDescription(
        recipe.description || ""
      );

      setCategory(
        recipe.category || ""
      );

      setCookTime(
        recipe.cookTime || ""
      );

      setCookTimeUnit(
        recipe.cookTimeUnit || "minutes"
      );

      setServings(
        recipe.servings || ""
      );

      setDifficulty(
        recipe.difficulty || ""
      );

      const loadedIngredients =
        recipe.ingredients || [""];

      setIngredients(loadedIngredients);

      setIngredientIds(
        loadedIngredients.map(
          (_, index) => index + 1
        )
      );

      const loadedSteps =
        recipe.steps || [""];

      setSteps(loadedSteps);

      setStepIds(
        loadedSteps.map(
          (_, index) => index + 1
        )
      );

      setImage(
        recipe.image || null
      );

      setImagePath(
        recipe.imagePath || null
      );

    } catch (error) {
      console.error(
        "Error loading recipe:",
        error
      );

      toast.error(
        "Failed to load recipe."
      );
    }
  }

 void loadRecipe();

}, [id, currentUser]);


  /*
  ========================================================
  INGREDIENT FUNCTIONS
  ========================================================
  */

  const handleIngredientChange = (
    index,
    value
  ) => {

    const list = [...ingredients];

    list[index] = value;

    setIngredients(list);

  };


  const addIngredient = () => {

    const nextId =
      ingredientIds.length > 0
        ? ingredientIds.at(-1) + 1
        : 1;


    setIngredients([
      ...ingredients,
      "",
    ]);

    setIngredientIds([
      ...ingredientIds,
      nextId,
    ]);

  };


  const removeIngredient = (index) => {

    const list = [...ingredients];

    list.splice(index, 1);

    setIngredients(list);


    const ids = [...ingredientIds];

    ids.splice(index, 1);

    setIngredientIds(ids);

  };


  /*
  ========================================================
  STEP FUNCTIONS
  ========================================================
  */

  const handleStepChange = (
    index,
    value
  ) => {

    const list = [...steps];

    list[index] = value;

    setSteps(list);

  };


  const addStep = () => {

    const nextId =
      stepIds.length > 0
        ? stepIds.at(-1) + 1
        : 1;


    setSteps([
      ...steps,
      "",
    ]);

    setStepIds([
      ...stepIds,
      nextId,
    ]);

  };


  const removeStep = (index) => {

    const list = [...steps];

    list.splice(index, 1);

    setSteps(list);


    const ids = [...stepIds];

    ids.splice(index, 1);

    setStepIds(ids);

  };


  /*
  ========================================================
  VALIDATE FORM
  ========================================================
  */

  function validateForm() {

    const newErrors = {};


    if (!recipeName.trim()) {

      newErrors.recipeName =
        "Recipe name is required.";

    }


    if (!description.trim()) {

      newErrors.description =
        "Recipe description is required.";

    }


    if (!category) {

      newErrors.category =
        "Please select a category.";

    }


    if (
      !cookTime ||
      Number(cookTime) <= 0
    ) {

      newErrors.cookTime =
        "Enter a valid cooking time.";

    }


    if (
      !servings ||
      Number(servings) <= 0
    ) {

      newErrors.servings =
        "Enter the number of servings.";

    }


    if (!difficulty) {

      newErrors.difficulty =
        "Please select a difficulty.";

    }


    const filledIngredients =
      ingredients.filter(
        (ingredient) =>
          ingredient.trim() !== ""
      );


    if (
      filledIngredients.length === 0
    ) {

      newErrors.ingredients =
        "Please add at least one ingredient.";

    }


    const filledSteps =
      steps.filter(
        (step) =>
          step.trim() !== ""
      );


    if (filledSteps.length === 0) {

      newErrors.steps =
        "Please add at least one cooking step.";

    }


    setErrors(newErrors);


    return (
      Object.keys(newErrors).length === 0
    );

  }


  /*
  ========================================================
  SUBMIT RECIPE
  ========================================================
  */

 const prepareRecipeImage = async () => {
  let recipeImage = image;
  let recipeImagePath = imagePath;
  let uploadedImagePath = null;

  if (
    currentUser &&
    image &&
    image instanceof File
  ) {
    setIsUploadingImage(true);

    try {
      const uploadImage = await uploadRecipeImage(
        currentUser,
        image
      );

      recipeImage = uploadImage.publicUrl;
      recipeImagePath = uploadImage.path;
      uploadedImagePath = uploadImage.path;
    } finally {
      setIsUploadingImage(false);
    }
  } else if (
    !currentUser &&
    image &&
    image instanceof File
  ) {
    recipeImage = await fileToDataURL(image);
  }

  return {
    recipeImage,
    recipeImagePath,
    uploadedImagePath,
  };
};


  const buildRecipe = (
    recipeImage,
    recipeImagePath
  ) => ({
    recipeName: recipeName.trim(),
    description: description.trim(),
    category,
    cookTime: Number(cookTime),
    cookTimeUnit,
    servings: Number(servings),
    difficulty,
    ingredients: ingredients.filter(
      (ingredient) => ingredient.trim() !== ""
    ),
    steps: steps.filter(
      (step) => step.trim() !== ""
    ),
    image: recipeImage || null,
    imagePath: recipeImagePath || null,
  });

  const resetForm = () => {
  setRecipeName("");
  setDescription("");
  setCategory("");
  setCookTime("");
  setCookTimeUnit("minutes");
  setServings("");
  setDifficulty("");
  setIngredients([""]);
  setIngredientIds([1]);
  setSteps([""]);
  setStepIds([1]);
  setImage(null);
  setImagePath(null);
  setErrors({});

  if (imageInputRef.current) {
    imageInputRef.current.value = "";
  }
};


  const saveCurrentUserRecipe = async (recipe) => {
  if (id) {
    await updateRecipe(id, recipe, currentUser);
    toast.success("Recipe updated successfully!");
    return;
  }

  await createRecipe(recipe, currentUser);

  toast.success("Your recipe has been published!");
  resetForm();
};


  const saveGuestRecipe = async (recipe) => {

    let guestRecipes = [];

    try {
      const storedRecipes = localStorage.getItem("guestRecipes");

      if (storedRecipes) {
        const parsedRecipes = JSON.parse(storedRecipes);

        if (Array.isArray(parsedRecipes)) {
          guestRecipes = parsedRecipes;
        }
      }
    } catch (error) {
      console.error("Error reading guest recipes:", error);
      guestRecipes = [];
    }

    if (id) {
      const recipeIndex = guestRecipes.findIndex(
        (item) => item.id === id
      );

      if (recipeIndex === -1) {
        toast.error("Recipe not found.");
        return;
      }

      guestRecipes[recipeIndex] = {
        ...guestRecipes[recipeIndex],
        ...recipe,
        id,
        source: "guest",
        ownerId: null,
        ownerName: "Guest",
        ownerPhoto: "",
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "guestRecipes",
        JSON.stringify(guestRecipes)
      );

      toast.success("Recipe updated successfully!");
      return;
    }

    const guestRecipeId =
      `guest-${Date.now()}-${crypto.randomUUID()}`;

    const guestRecipe = {
      ...recipe,
      id: guestRecipeId,
      source: "guest",
      ownerId: null,
      ownerName: "Guest",
      ownerPhoto: "",
      likes: 0,
      comments: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString(),
    };

    guestRecipes.push(guestRecipe);

    localStorage.setItem(
      "guestRecipes",
      JSON.stringify(guestRecipes)
    );

    toast.success("Recipe saved on this device!");

    resetForm();
  };

  const deleteOldRecipeImage = async () => {
  if (!currentUser || !id || !imagePath) {
    return;
  }

  try {
    await deleteRecipeImage(
      currentUser,
      imagePath
    );
  } catch (error) {
    console.error(
      "Failed to delete old recipe image:",
      error
    );
  }
};

const cleanupUploadedImage = async (uploadedImagePath) => {
  if (!currentUser || !uploadedImagePath) {
    return;
  }

  try {
    await deleteRecipeImage(
      currentUser,
      uploadedImagePath
    );
  } catch (error) {
    console.error(
      "Failed to clean up uploaded recipe image:",
      error
    );
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting || !validateForm()) {
    return;
  }

  setIsSubmitting(true);

  let uploadedImagePath = null;

  try {
    const imageResult = await prepareRecipeImage();

    uploadedImagePath = imageResult.uploadedImagePath;

    const recipe = buildRecipe(
      imageResult.recipeImage,
      imageResult.recipeImagePath
    );

    if (currentUser) {
      await saveCurrentUserRecipe(recipe);

      if (id && uploadedImagePath) {
        await deleteOldRecipeImage();
      }

      return;
    }

    await saveGuestRecipe(recipe);
  } catch (error) {
    console.error(
      "Error saving recipe:",
      error
    );

    await cleanupUploadedImage(uploadedImagePath);

    toast.error(
      "Something went wrong while saving the recipe."
    );
  } finally {
    setIsSubmitting(false);
  }
};


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (

    <div className="max-w-4xl mx-auto p-6">


      <h1 className="text-4xl font-bold mb-8 text-center">

        {id ? (

          "Edit Recipe"

        ) : (

          <>

            Add{" "}

            <span className="text-green-600">

              Recipe

            </span>

          </>

        )}

      </h1>


      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >


        {/* ==============================================
            RECIPE NAME
        ============================================== */}

        <input

          type="text"

          placeholder="Recipe Name"

          value={recipeName}

          onChange={(e) => {

            setRecipeName(
              e.target.value
            );

            setErrors((prev) => ({

              ...prev,

              recipeName: "",

            }));

          }}

          className={`w-full rounded-lg p-3 border ${
            errors.recipeName
              ? "border-red-500"
              : "border-gray-300"
          }`}

        />


        {errors.recipeName && (

          <p className="text-red-500 text-sm mt-1">

            {errors.recipeName}

          </p>

        )}


        {/* ==============================================
            DESCRIPTION
        ============================================== */}

        <textarea

          placeholder="Recipe Description"

          value={description}

          onChange={(e) => {

            setDescription(
              e.target.value
            );

            setErrors((prev) => ({

              ...prev,

              description: "",

            }));

          }}

          className={`w-full border rounded-lg p-3 h-32 ${
            errors.description
              ? "border-red-500"
              : "border-gray-300"
          }`}

        />


        {errors.description && (

          <p className="text-red-500 text-sm mt-1">

            {errors.description}

          </p>

        )}


        {/* ==============================================
            CATEGORY
        ============================================== */}

        <select

          value={category}

          onChange={(e) => {

            setCategory(
              e.target.value
            );

            setErrors((prev) => ({

              ...prev,

              category: "",

            }));

          }}

          className={`w-full border rounded-lg p-3 ${
            errors.category
              ? "border-red-500"
              : "border-gray-300"
          }`}

        >

          <option value="">

            Select Category

          </option>


          {categories.map(
            (item) => (

              <option
                key={item.id}
                value={item.name}
              >

                {item.name}

              </option>

            )
          )}

        </select>


        {errors.category && (

          <p className="text-red-500 text-sm mt-1">

            {errors.category}

          </p>

        )}


        {/* ==============================================
            TIME / SERVINGS / DIFFICULTY
        ============================================== */}

        <div className="grid md:grid-cols-3 gap-4">


          {/* COOKING TIME */}

          <div>

            <input

              type="number"

              placeholder="Cooking Time"

              value={cookTime}

              onChange={(e) => {

                setCookTime(
                  e.target.value
                );

                setErrors((prev) => ({

                  ...prev,

                  cookTime: "",

                }));

              }}

              className={`w-full rounded-lg p-3 border ${
                errors.cookTime
                  ? "border-red-500"
                  : "border-gray-300"
              }`}

            />


            <select

              value={cookTimeUnit}

              onChange={(e) =>
                setCookTimeUnit(
                  e.target.value
                )
              }

              className="w-full rounded-lg p-3 border border-gray-300"

            >

              <option value="minutes">

                Minutes

              </option>

              <option value="hours">

                Hours

              </option>

            </select>


            {errors.cookTime && (

              <p className="text-red-500 text-sm mt-1">

                {errors.cookTime}

              </p>

            )}

          </div>


          {/* SERVINGS */}

          <div>

            <input

              type="number"

              placeholder="Servings"

              value={servings}

              onChange={(e) => {

                setServings(
                  e.target.value
                );

                setErrors((prev) => ({

                  ...prev,

                  servings: "",

                }));

              }}

              className={`w-full rounded-lg p-3 border ${
                errors.servings
                  ? "border-red-500"
                  : "border-gray-300"
              }`}

            />


            {errors.servings && (

              <p className="text-red-500 text-sm mt-1">

                {errors.servings}

              </p>

            )}

          </div>


          {/* DIFFICULTY */}

          <div>

            <select

              value={difficulty}

              onChange={(e) => {

                setDifficulty(
                  e.target.value
                );

                setErrors((prev) => ({

                  ...prev,

                  difficulty: "",

                }));

              }}

              className={`w-full rounded-lg p-3 border ${
                errors.difficulty
                  ? "border-red-500"
                  : "border-gray-300"
              }`}

            >

              <option value="">

                Difficulty

              </option>

              <option value="Easy">

                Easy

              </option>

              <option value="Medium">

                Medium

              </option>

              <option value="Hard">

                Hard

              </option>

            </select>


            {errors.difficulty && (

              <p className="text-red-500 text-sm mt-1">

                {errors.difficulty}

              </p>

            )}

          </div>


        </div>


        {/* ==============================================
            IMAGE
        ============================================== */}

        <div>

          <label htmlFor="recipe-image" className="block font-medium mb-2">
            Recipe Image
          </label>
          <input
          ref={imageInputRef}
            type="file"
            id="recipe-image"
            accept="image/jpeg, image/png, image/webp"

            onChange={(e) => {

              const selectedFile =
                e.target.files?.[0] ||
                null;

              setImage(
                selectedFile
              );

            }}
            className="border-green-500 border rounded-lg p-2 w-full"/>

          {image && (
            <img
            src={
              image instanceof File
              ? URL.createObjectURL(image)
              : image
            }
            alt="Recipe preview"
            className="mt-4 w-full max-h-64 object-cover rounded-lg"/>
            )}

        </div>


        {/* ==============================================
            INGREDIENTS
        ============================================== */}

        <div>

          <h2 className="text-2xl font-semibold mb-3">

            Ingredients

          </h2>


          {ingredients.map(
            (ingredient, index) => (

              <div

                key={
                  ingredientIds[index]
                }

                className="flex gap-2 mb-2"

              >

                <input

                  type="text"

                  value={ingredient}

                  onChange={(e) => {

                    handleIngredientChange(
                      index,
                      e.target.value
                    );

                    setErrors((prev) => ({

                      ...prev,

                      ingredients: "",

                    }));

                  }}

                  className="flex-1 rounded-lg p-3 border"

                  placeholder={`Ingredient ${
                    index + 1
                  }`}

                />


                <button

                  type="button"

                  onClick={() =>
                    removeIngredient(
                      index
                    )
                  }

                  className="bg-red-500 text-white px-4 rounded-lg hover:bg-red-600"

                >

                  X

                </button>

              </div>

            )
          )}


          {errors.ingredients && (

            <p className="text-red-500 text-sm mt-2">

              {errors.ingredients}

            </p>

          )}


          <button

            type="button"

            onClick={
              addIngredient
            }

            className="bg-green-600 text-white px-5 py-2 rounded-lg"

          >

            + Add Ingredient

          </button>

        </div>


        {/* ==============================================
            STEPS
        ============================================== */}

        <div>

          <h2 className="text-2xl font-semibold mb-3">

            Steps

          </h2>


          {steps.map(
            (step, index) => (

              <div

                key={
                  stepIds[index]
                }

                className="flex gap-2 mb-2"

              >

                <textarea

                  value={step}

                  onChange={(e) => {

                    handleStepChange(
                      index,
                      e.target.value
                    );

                    setErrors((prev) => ({

                      ...prev,

                      steps: "",

                    }));

                  }}

                  className="flex-1 rounded-lg p-3 border"

                  placeholder={`Step ${
                    index + 1
                  }`}

                />


                <button

                  type="button"

                  onClick={() =>
                    removeStep(
                      index
                    )
                  }

                  className="bg-red-500 text-white px-4 rounded-lg"

                >

                  X

                </button>

              </div>

            )
          )}


          {errors.steps && (

            <p className="text-red-500 text-sm mt-2">

              {errors.steps}

            </p>

          )}


          <button

            type="button"

            onClick={addStep}

            className="bg-green-600 text-white px-5 py-2 rounded-lg"

          >

            + Add Step

          </button>

        </div>


        {/* ==============================================
            SUBMIT
        ============================================== */}

        {(() => {
  let buttonText = "Save Recipe";

  if (isUploadingImage) {
    buttonText = "Uploading Image...";
  } else if (isSubmitting && id) {
    buttonText = "Updating Recipe...";
  } else if (isSubmitting && currentUser) {
    buttonText = "Publishing Recipe...";
  } else if (isSubmitting) {
    buttonText = "Saving Recipe...";
  } else if (id) {
    buttonText = "Update Recipe";
  } else if (currentUser) {
    buttonText = "Publish Recipe";
  }

  return (
    <button
      type="submit"
      disabled={isSubmitting || isUploadingImage}
      className="w-full bg-green-600 text-white py-4 rounded-lg text-lg hover:bg-white transition hover:text-green-600 border border-green-500"
    >
      {buttonText}
    </button>
  );
})()}


      </form>

    </div>

  );

}


export default AddRecipe;