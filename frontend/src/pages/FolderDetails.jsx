import {
 useEffect,
 useState
} from "react";

import {
 useParams
} from "react-router-dom";

import API from "../api/api";

function FolderDetails(){

 const { id } =
 useParams();

 const [files,
 setFiles] =
 useState([]);

 useEffect(() => {

  const fetchFiles =
  async () => {

   const token =
   localStorage
   .getItem("token");

   const response =
   await API.get(
    `/folders/${id}/files`,
    {
      headers:{
       Authorization:
       `Bearer ${token}`
      }
    }
   );

   setFiles(
    response.data
   );
  };

  fetchFiles();

 }, [id]);

 return(

  <div>

   <h1>
    Folder Files
   </h1>

   {files.map(file => (

    <div
     key={file.id}
     className="file-card"
    >

      📄 {file.filename}

    </div>

   ))}

  </div>

 );
}

export default FolderDetails;