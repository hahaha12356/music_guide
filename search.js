document.addEventListener('DOMContentLoaded', function () {
    const searchIcon = document.getElementById('search-icon');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const modal = document.getElementById('search-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const resultsContainer = document.getElementById('search-results-container');

    let idx, store;

    // Fetch the search index
    fetch('/search-index.json')
        .then(response => response.json())
        .then(data => {
            idx = lunr.Index.load(data.index);
            store = data.store;
            console.log("Search index loaded.");
        })
        .catch(err => console.error('Error loading search index:', err));

    // Toggle search bar visibility
    searchIcon.addEventListener('click', () => {
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            searchInput.focus();
        }
    });

    const displayResults = (results) => {
        resultsContainer.innerHTML = '';
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="text-gray-500">No results found.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'space-y-4';

        results.forEach(result => {
            const item = store[result.ref];
            const li = document.createElement('li');
            li.className = 'border-b pb-4';
            const a = document.createElement('a');
            a.href = result.ref;
            a.className = 'text-xl font-bold text-blue-600 hover:underline';
            a.textContent = item.title;
            const p = document.createElement('p');
            p.className = 'text-gray-600 mt-1';
            p.textContent = item.description;

            li.appendChild(a);
            li.appendChild(p);
            ul.appendChild(li);
        });

        resultsContainer.appendChild(ul);
    };

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query && idx) {
                const results = idx.search(query);
                displayResults(results);
                modal.classList.remove('hidden');
            }
        }
    });

    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
