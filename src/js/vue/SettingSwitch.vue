<template>
    <div
        class="switch"
        :class="{active: value}"
    >
        <div class="handle"></div>
    </div>
</template>

<script>
    export default {
        name: 'setting-switch',
        props: {
            value: {
                type: Boolean,
                required: true,
            },
            onChange: {
                type: Function,
                required: false,
            },
        },
    }
</script>
