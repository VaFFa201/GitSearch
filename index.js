class GitSearch {
    constructor(container) {
        this.container = container;
        this.$input = container.querySelector('.git-search__input');
        this.$datalist = container.querySelector('.git-search__res');
        this.$list = container.querySelector('.git-search__list');
        this.repositories = [];

        this.debounceTimeout = null;
        this.responsesNum = 5;

        this.$input.addEventListener('input', this.inputHandler.bind(this));
        this.$datalist.addEventListener('click', this.selectHandler.bind(this));
    }

    inputHandler(event) {
        const keyword = event.target.value.trim();
        if (keyword.length <= 1) {
            this.$datalist.innerHTML = '';
            return;
        }

        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = setTimeout(() => {
            const url = `https://api.github.com/search/repositories?q=${keyword}&per_page=${this.responsesNum}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.repositories = data.items;
                    this.updateList();
                })
                .catch(error => console.error(error));
        }, 500);
    }

    selectHandler(event) {
        const repository = this.repositories.find(repo => repo.full_name === event.target.textContent);
        if (!repository) return;

        const owner = repository.owner.login;
        const name = repository.name;
        const stars = repository.stargazers_count;

        const $repo = document.createElement('div');
        $repo.classList.add('git-search__repo')
        $repo.textContent = `${owner}, ${name} (${stars} звезд)`;

        const $button = document.createElement('button');
        $button.textContent = 'Удалить';
        $button.addEventListener('click', this.removeHandler.bind(this));

        $repo.appendChild($button);
        this.$list.appendChild($repo);

        this.$input.value = '';
        this.$datalist.innerHTML = '';
    }

    removeHandler(event) {
        event.target.parentNode.remove();
    }

    updateList() {
        this.$datalist.innerHTML = '';
        this.repositories.forEach(repository => {
            const $autoComp = document.createElement('div');
            $autoComp.classList.add('git-search__autocomplete')
            $autoComp.textContent = repository.full_name;
            this.$datalist.appendChild($autoComp);
        });
    }
}

const container = document.querySelector('.git-search');
new GitSearch(container);