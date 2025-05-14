import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import button from "@mui/material/Button";
import Button from "@mui/material/Button";



const TOS = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
            <Card sx={{ minWidth: 275, margin: '2rem' }}>
                <CardContent>
                    <div className="centertext mb-5">
                        <Typography variant="h5" component="div" >
                            Terms of Service
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            Last updated: 5/12/2025
                        </Typography>
                    </div>
                    <Typography variant="body2">
                        These terms and conditions outline the rules and regulations for the use of our service. This website was made possible by the Deezer API.
                    </Typography>
                  


                    <Typography variant="body2" sx={{ mt: 2 }}>
                        By accessing this website we assume you are older than 13 years of age. If you do not agree to these terms and conditions, please do not use our service.
                    </Typography>

                    <Button variant="contained" color="primary" sx={{ mt: 2 }} href="/home">
                        Back to Home
                    </Button>

                </CardContent>
            </Card>
        </div>

    )
}

export default TOS;
