document.addEventListener("DOMContentLoaded", () => {
  const footerYear = document.getElementById("build-year");
  if (footerYear) {
    footerYear.textContent = `主题包已启用 ${new Date().getFullYear()}`;
  }
});
