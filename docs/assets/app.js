// Minimal JS for sidebar toggle on mobile
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
    });

    // Close sidebar when a link is clicked on mobile
    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.add('hidden');
        }
      });
    });

    // Highlight current page
    const currentPath = window.location.pathname;
    links.forEach(link => {
      link.classList.remove('active');
      if (link.href.includes(currentPath.split('/').pop())) {
        link.classList.add('active');
      }
    });
  }
});
