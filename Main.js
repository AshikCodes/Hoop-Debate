import { useEffect, useState } from "react";
import LeftSide from "./LeftSide";
import Question from "./Question";
import RightSide from "./RightSide";
import axios from "axios";
import Modal from "./Modal";


const Main = () => {
    //prodUrl = 'https://hoopdebate.onrender.com'
    //devUrl = 'http://localhost:3001'
    let url = 'https://hoopdebate.onrender.com'
    // let url = 'http://localhost:3001'

    const [wyr, setWyrs] = useState()
    const [wyrLength, setWyrLength] = useState()
    const [currentWyr, setCurrentWyr] = useState()
    const [wyrNumber, setWyrNumber] = useState(0)

    const [leftStat, setLeftStat] = useState(null)
    const [rightStat, setRightStat] = useState(null)

    const [countLeft, setCountLeft] = useState(0)
    const [countRight, setCountRight] = useState(0)

    const [modal, setModal] = useState(false)


    useEffect(() => {

        async function getWyr(){
            try {
                let result = await axios.get(`${url}/get_wyr`)
                // console.log(`result here is ${JSON.stringify(result)}`)
                var str = JSON.stringify(result, undefined, 2)
                setWyrs(result.data)
                setWyrLength(result.data.length)
                setCurrentWyr(result.data[0])
            }
            catch(err) {
                // console.log(`Error here is ${err}`)
            }
        }
        getWyr()

    },[])

    useEffect(() => {
        if(wyr && leftStat === null && rightStat === null){
            if(wyrNumber !== 0){
                setCurrentWyr(wyr[wyrNumber])
            }
            if(wyrNumber === wyrLength - 1){
                setWyrNumber(0)
            }
        }
        
    }, [wyrNumber, leftStat, rightStat])

    return ( 
        <div>
            {currentWyr && <div>
                <Question question={currentWyr.wyr_question} setModal={setModal}/>
                <div className="option-container">
                        <LeftSide 
                            currentWyr={currentWyr} 
                            option1={currentWyr.wyr_option1} 
                            setWyrNumber={setWyrNumber} 
                            setLeftStat={setLeftStat}
                            leftStat={leftStat}
                            setRightStat={setRightStat}
                            setCountLeft={setCountLeft}
                            setCountRight={setCountRight}
                            count={countLeft}
                            url={url}
                        />
                        <RightSide 
                            currentWyr={currentWyr} 
                            option2={currentWyr.wyr_option2} 
                            setWyrNumber={setWyrNumber} 
                            setRightStat={setRightStat}
                            rightStat={rightStat}
                            setLeftStat={setLeftStat}
                            setCountLeft={setCountLeft}
                            setCountRight={setCountRight}
                            count={countRight}
                            url={url}
                        />
                </div>
            </div>}
            {modal && <div className="overlay">
                <Modal setModal={setModal} url={url}/>
                </div>}
        </div>
     );
}
 
export default Main;