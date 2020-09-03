const app = new Vue({
    el: '#app',
    data: {
        chosenOption: null,
        chosenWinnersCount: null,
    },
    created() {

    },
    methods: {
        postCookieAccept: async function() {
            document.getElementById('cookie-warning').remove();
            axios.get('/api/accept-cookie');
        },
        chooseOption: function(option, e) {
            e.preventDefault();
            this.chosenOption = option;
        },
        chooseWinnersCount: function() {
            this.chosenWinnersCount = document.querySelector('[name=max_winners]').value;
        },
        generateRandom: function(e) {
            if(this.chosenOption == null) {
                alert('Plese select an option to continue');
                e.preventDefault();
                return false;
            }
            if(this.chosenWinnersCount == null) {
                alert('Plese select how many winners can be maximum');
                e.preventDefault();
                return false;
            }

            return true;
        }
    }
});

$(document).ready(function() {
    // Initialize dropdown
    jQuery('.ui.dropdown').dropdown();
})