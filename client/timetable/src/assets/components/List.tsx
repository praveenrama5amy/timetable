import { useState } from "react";

const List = () => {
    const [selected, setSelected] = useState(-1);
    const list = ["Mumbai", "Chennai", "Coimbatore", "Namakkal", "Trichy"];
    return (
        <>
            <h1>List</h1>
            <ul className="list-group">
                {list.map((item, index) => (
                    <li className={selected === index ? "list-group-item active" : "list-group-item button"} key={item} onClick={(e) => { setSelected(index) }}>{item}</li>
                    
                ))}
            </ul>
        </>
    );
};

export default List;
