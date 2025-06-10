<template>
    <div class="logo">
        <img class="bg" src="https://dspl.innogamescdn.com/asset/340473d2/graphic/start2/logo/bg.webp"
            alt="Logo background">
        <a href="/" class="main-logo">
            <img src="https://dspl.innogamescdn.com/asset/340473d2/graphic/start2/logo/logo-pl_PL.png"
                alt="Plemiona logo">
        </a>
        <a href="/" class="branding-logo">
            <img src="https://dspl.innogamescdn.com/asset/340473d2/graphic/start2/logo/sublogo-en.webp"
                alt="Branding logo">
        </a>
    </div>
</template>

<script setup lang="ts">
// Komponent Logo - wyświetla logo Plemiona z odpowiednim stylingiem
</script>

<style scoped>
.logo {
    position: relative;
    background: url("https://dspl.innogamescdn.com/asset/340473d2/graphic/start2/logo/bg.webp") 50%/100%;
    height: 60px;
    background-repeat: no-repeat;
}

.logo .bg {
    vertical-align: top;
    width: 100%;
    height: 100%;
    opacity: 0;
}

.logo .main-logo,
.logo .branding-logo {
    top: 4%;
    left: 50%;
    -webkit-transform: translate(-50%, 0%);
    transform: translate(-50%, 0%);
    position: absolute;
}

.logo .main-logo img,
.logo .branding-logo img {
    max-height: 50px;
    width: auto;
}

/* Responsive design */
@media (max-width: 768px) {
    .logo {
        height: 50px;
    }

    .logo .main-logo img,
    .logo .branding-logo img {
        max-height: 40px;
    }
}

@media (max-width: 480px) {
    .logo {
        height: 40px;
    }

    .logo .main-logo img,
    .logo .branding-logo img {
        max-height: 30px;
    }
}
</style>