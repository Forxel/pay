import { LinearProgress, linearProgressClasses, styled } from '@mui/material';
import { useState } from 'react';
import { Button } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import './App.css';
import { downloadFromAttachmentUrls } from "./disbox-file-manager";
import { formatSize, pickLocationAsWritable } from "./file-utils.js";
import NavigationBar from './NavigationBar';

const BorderLinearProgress = styled(LinearProgress)(({ }) => ({
    height: 20,
    borderRadius: 5,
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
    },
}));


function File() {
    const [searchParams] = useSearchParams();
    const [progressValue, setProgressValue] = useState(-1);
    const [currentlyDownloading, setCurrentlyDownloading] = useState(false);

    const onProgress = (value, total) => {
        const percentage = Number(Math.round((value / total) * 100).toFixed(0));
        setProgressValue(percentage);
        debugger
        if (percentage === 100) {
            setTimeout(() => {
                setCurrentlyDownloading(false);
                setProgressValue(0);
            }, 1500);
        }
    }

    async function download () {
        const fileName = searchParams.get("name");
        let base64AttachmentUrls = searchParams.get("attachmentUrls");
        base64AttachmentUrls = base64AttachmentUrls.replace(/~/g, '+').replace(/_/g, '/').replace(/-/g, '=');
        const attachmentUrls = atob(base64AttachmentUrls);
        const attachmentUrlsArray = JSON.parse(attachmentUrls);

        const writable = await pickLocationAsWritable(fileName);
        setCurrentlyDownloading(true);
        setProgressValue(0);
        await downloadFromAttachmentUrls(attachmentUrlsArray, writable, onProgress, searchParams.get("size"));
    }

    
    return (searchParams.get("name") !== null && searchParams.get("attachmentUrls") !== null && searchParams.get("size") !== null) ? 
    (<div>
        <Helmet>
            <title> {searchParams.get("name")}</title>
            <meta name="description" content="Shared from Disbox" />
        </Helmet>
        <NavigationBar />
        <div className="App App-header" style={{ color: "black", }}>
            <div style={{ backgroundColor: "#FCFCFC", width: "66%", height: "90vh" }}>
                <div style={{marginTop: "25%", marginBottom: "25%"}}>
                    <h1 style={{ fontSize: "3rem", display: "inline" }} className='mt-3' >
                        <b>{searchParams.get("name")}</b>
                    </h1>
                    <h1 style={{ marginLeft: "1rem", fontSize: "1.25rem", display: "inline", color:"darkgray" }}>
                        <b>{formatSize(searchParams.get("size"))}</b>
                    </h1>
                    <Button type="submit" variant="primary" disabled={currentlyDownloading} onClick={download} style={{margin: "auto", marginTop: "1rem", fontSize: "2rem", display: "block" }}><b>Download</b></Button>
                    {currentlyDownloading &&                                 
                        <BorderLinearProgress variant="determinate" value={progressValue} style={{width: "50%", marginLeft: "25%", marginTop: "1rem" }}/>
                    }
                    {(!currentlyDownloading && progressValue != -1) &&
                        <h1 style={{ fontSize: "2rem", display: "block",  marginTop: "1rem" }}><b>Download complete.</b></h1>
                    }
                </div>
            </div>
        </div>
    </div>) : 
    (<div className="App App-header" style={{ color: "red", justifyContent: "center", height: "100vh"}}>
        <h1 style={{ fontSize: "2rem" }}>
            <b>Oops, something went wrong.</b>
        </h1>
    </div>);
}

export default File;
