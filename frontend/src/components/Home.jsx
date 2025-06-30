import TrendingCast from "./TrendingCast"
import Info from "./Info"



export default function Home(){



    return (
        <div className="flex flex-col lg:flex lg:flex-row">   
            <Info />
            <TrendingCast />
        </div>
    )
}