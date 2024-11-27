"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { VideoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { TabsContent } from "./ui/tabs";

const RecordButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );
      setVideoDevices(videoDevices);
      setAudioDevices(audioDevices);
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      if (audioDevices.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(audioDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error getting camera and microphone devices:", err);
    }
  };

  const startCamera = async () => {
    try {
      if (stream) {
        stopCamera();
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
        },
        audio: {
          deviceId: selectedMicrophone
            ? { exact: selectedMicrophone }
            : undefined,
        },
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
  };

  useEffect(() => {
    getCameraDevices();
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        getCameraDevices();
      })
      .catch((err) =>
        console.error("Error requesting camera and microphone permission:", err)
      );
  }, []);

  useEffect(() => {
    if (selectedCamera && stream) {
      startCamera();
    }
  }, [selectedCamera]);

  useEffect(() => {
    if (selectedMicrophone && stream) {
      startCamera();
    }
  }, [selectedMicrophone]);

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogTrigger asChild>
          <Button className="text-primary bg-primary-foreground hover:bg-primary-foreground/80">
            <VideoIcon
              className="w-4 h-4 text-primary"
              fill="currentColor"
            />{" "}
            <span>Record</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          className=" text-primary"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              <Input
                placeholder="Untitled Loop"
                className="outline-none text-primary border-none focus-visible:ring-0 focus-visible:border-none"
              />
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
              <Tabs
                defaultValue="screen"
                className="w-full"
                onValueChange={handleTabChange}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="screen"
                    className="bg-primary text-primary-foreground data-[state=active]:bg-primary/50"
                  >
                    Screen
                  </TabsTrigger>
                  <TabsTrigger
                    value="camera"
                    className="bg-primary text-primary-foreground data-[state=active]:bg-primary/50"
                  >
                    Camera
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="bg-primary text-primary-foreground data-[state=active]:bg-primary/50"
                  >
                    Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="screen">screen</TabsContent>
                <TabsContent
                  value="camera"
                  className="mt-4"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="upload">upload</TabsContent>
              </Tabs>
              <div className="flex flex-col items-center space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <VideoIcon className="w-6 h-6 text-red-500" />
                  <select
                    className="bg-white text-black rounded-md p-2"
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                  >
                    <option value="">Camera off</option>
                    {videoDevices.map((device) => (
                      <option
                        key={device.deviceId}
                        value={device.deviceId}
                      >
                        {device.label ||
                          `Camera ${videoDevices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <VideoIcon className="w-6 h-6 text-blue-500" />
                  <select
                    className="bg-white text-black rounded-md p-2"
                    value={selectedMicrophone}
                    onChange={(e) => setSelectedMicrophone(e.target.value)}
                  >
                    <option value="">Microphone off</option>
                    {audioDevices.map((device) => (
                      <option
                        key={device.deviceId}
                        value={device.deviceId}
                      >
                        {device.label ||
                          `Microphone ${audioDevices.indexOf(device) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <Button className="bg-red-500 text-white w-full py-2 rounded-md">
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Start recording
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecordButton;
