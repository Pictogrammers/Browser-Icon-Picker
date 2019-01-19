<template>
    <div class="overflow-menu-container">
        <i
            @click="open = true"
            class="mdi mdi-dots-vertical"
        ></i>

        <transition name="overflow-menu">
            <div
                v-show="open"
                class="overflow-menu"
                :class="'attach-to-'+attachTo"
            >
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script>
    export default {
        name: 'overflow-menu',
        props: {
            onOpen: {
                type: Function,
                required: true,
            },
            onClose: {
                type: Function,
                required: true,
            },
            attachTo: {
                type: String,
                required: true,
                validator: (value) => ['top', 'bottom'].indexOf(value) !== -1,
            }
        },
        data: () => ({
            open: false,
        }),
        methods: {
            close() {
                this.open = false;
            }
        },
        watch: {
            open(value) {
                if (value === false) {
                    this.onClose();
                }
                else {
                    this.onOpen();
                }
            }
        }
    }
</script>
