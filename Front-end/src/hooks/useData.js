async function useData(file) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("data", data);
    return data;
  } catch (error) {
    console.error("Erreur lors du chargement du fichier JSON :", error);
    throw error; // Re-lance l'erreur pour que le caller puisse la gérer
  }
}

export { useData };
