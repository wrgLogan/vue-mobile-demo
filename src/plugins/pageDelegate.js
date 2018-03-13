var install = function(Vue, option) {
    Vue.mixin({
        created: function() {
            if (this.$options.willEnterPage) {
                this.$options.willEnterPage.apply(this);
            }
        },
        mounted: function() {
            if(this.$options.didEnterPage) {
                this.$options.didEnterPage.apply(this);
            }
        }
    })
}

export default {
    install: install
};