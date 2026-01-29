import { Outlet } from "react-router-dom";
import Layout from "./wrapperLayout.jsx";
import { useCurrentRender } from "../context/renderContext.jsx";

const Home = () => {
    const { currentRender, handleSetCurrentRender } = useCurrentRender();

    const handleSetCurrentRenderLocal = (newRender) => {
        handleSetCurrentRender(newRender);
    };

    return (
        <Layout
            subTitle={currentRender}
            setCurrentRender={handleSetCurrentRenderLocal}
        >
            <Outlet />
        </Layout>
    );
};

export default Home;