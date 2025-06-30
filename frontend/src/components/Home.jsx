import TrendingCast from "./TrendingCast"
import Info from "./Info"



export default function Home(){



    return (
        <div className="flex flex-col xl:flex xl:flex-row">   
            <Info />
            <TrendingCast />
        </div>
    )
}