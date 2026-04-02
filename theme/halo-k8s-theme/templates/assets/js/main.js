document.addEventListener("DOMContentLoaded", () => {
  const footerYear = document.getElementById("build-year");
  if (footerYear) {
    footerYear.textContent = `Theme package active in ${new Date().getFullYear()}`;
  }
});
