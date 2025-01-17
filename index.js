document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toggle-abstract').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the page from jumping to the top
            const abstract = this.nextElementSibling; // Get the sibling <div>
            if (abstract && abstract.classList.contains('hidden')) {
                abstract.classList.remove('hidden'); // Show the abstract
            } else if (abstract) {
                abstract.classList.add('hidden'); // Hide the abstract
            }
        });
    });
});