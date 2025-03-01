import PosterBg from "@/components/PosterBg/PosterBg"

const login = ({ csrfToken }) => {
    return <div>
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>

        <PosterBg />

        <lottie-player src="https://assets4.lottiefiles.com/packages/lf20_PclCeNBIjw.json"  background="transparent"  speed="1"  style={{pointerEvents: 'none', width: '100%', height: '200px', transform: 'scale(1.5)'}}  autoplay></lottie-player>
    </div>
}

export default login