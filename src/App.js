// import React from 'react';
// import logo from './logo.svg';
// import './App.css';
// import { withAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react'

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <h1>We now have Auth!</h1>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//       <AmplifySignOut/>
//     </div>
//   );
// }

// export default withAuthenticator(App);

import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
// import { bigIntLiteral } from '@babel/types';
// import { S3Image } from 'aws-amplify-react';


const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });

    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if(note.image){
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))

    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if(formData.image){
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  async function onChange(e){
    if(!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <input
        type='file'
        onChange={onChange}
      />
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>
                {note.description}
              </p>
              <button onClick={() => deleteNote(note)}>Delete note</button>
              {
                note.image && <img src={note.image} style={{width: 800}} alt="image not found" />
                // <img 
                // src = "https://idealoctopalmtree77a2cc6f2cd44ea0915cbc15e21f4e30226-staging.s3.us-east-2.amazonaws.com/public/97523C2B-F336-4CE1-B0C2-181AB1A85353.heic?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA6FLZUWWMHZDTCT4O%2F20210706%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20210706T235041Z&X-Amz-Expires=900&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEGgaCXVzLWVhc3QtMiJGMEQCIAPJeoyYAnCKzV9INKwcbp6USxpSyWCuAWqf9eCtbnbmAiBmzneMsLw4hKp%2BRRsMakM38bIODyU6CBD6zs%2BF1ehNSirEBAhREAAaDDk3MzYwMjA3NjA1NiIMcP83c%2BoFI%2BZGcS8EKqEE7ZfE7RNEKUMNB61vp2KcxZEY0O%2Fmdja%2F94HdZ3ayvI%2FgiScp%2FRZuEmNpWngSELzBMuB5u337DWo%2BCEOtKKgNRcy%2Bqrzkbta%2FHyLgut7HLIhYOW0T8O%2BQeauVps8NhHEH5aPQ%2B8mbMGlJSaA6TvPe9AI58eW8bHlnAY1UzT7sYQeFXh0FJSfaSUKRn6g%2Bx6PhMhAukznq5nkgYjlFBhM2Ut%2F8YYNstMV0s1gAxxg3b2I9Vcv%2BDLTsf%2F4OBdAQWMs%2BnjUXaURyjjq%2B9p8NpNA6SRNNN7kK4fWW%2B23Xko2TLrNyas28rGmZ8rawibQqdWTym0ZSXKNxF4%2F80NpCdRHaWUUnMt3tgx4MBTX0%2B5DpClxkw2zLGs3KkdHdkC0Cn67P2s3pvJum29Ke5jVCuPMB2OYjs81SVww6KlJ9B%2Bo94p%2BbXUZxBDkPGDAxhqUfnna60A2LVfP7Cnw2qmPdV3KMEgArQygiNShbeS4XZ%2FFdGJwe5B4f%2FmFtJAldCfeApUVIp0p0h05xAD9HvDT3ToF%2FfQiJRWe87mCADVxfwnxX8j012kNNRaNiLP3fHFRX9NNPIhIyy%2BGKKRrz%2BMjuKDOr%2FdGSMuSHVF1Eq3ESoutpgXOPLKpml6SnF5tdyCuLIXNeBINHDFTE4WnPGvgflPwL0L03Hzen4KdlveJ1Ip3V9LxI5Oz3%2F3Pf2nzOyDPi2P8ADbJC3nXB15VhDHGqM9QDxaow3tWThwY6hgIIK3WXxUMLd%2FIkEXRLEZVaoffRbnl8l2HIzvSx%2BAREd87vyejg%2BffCy9rBJgQXv7hu0RXJ0uApf8P9G8oRE1%2FVdDJh6QnBUATeX7d9srxyc7dwO6Q5o9EuPLhG%2Bd1onPHjVqAamx7lNdks%2BweeLYCTTPToLbRVHo5FeEuzC3sEG%2Fbyyqlhxs4m%2B3KGBE92k6pMEZg7UjFoERnqTbDFn1XBus3l2%2FMlUCaKqxg0KE0udxJjObWjlUr%2Fgi8%2FPYH2s6c23w%2BHcv3e%2FN707h4f6Po3LlBfi8LBnD2YBvE1gBytCxW0VirZTDo055wP1IizWE4CEH9qBcqKhaarWHlnAW%2BONx8y6zZW&X-Amz-Signature=abb9d8a7136d61652b60d8420b4d1819d0d124dea1d6a84bc0003bd2c73c0844&X-Amz-SignedHeaders=host&x-amz-user-agent=aws-sdk-js%2F3.6.1%20os%2FmacOS%2F10.15.7%20lang%2Fjs%20md%2Fbrowser%2FChrome_91.0.4472.114%20api%2Fs3%2F3.6.1%20aws-amplify%2F4.1.1_js&x-id=GetObject"
                // alt = "image note found" 
                // />

                // note.image && <img src={note.image} alt=''/>
              }
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
