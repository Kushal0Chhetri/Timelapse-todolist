//
//  takeScreenshot.swift
//  TimeLapseVideoProject
//
//  Created by Donghan Hu on 12/7/22.
//  Copyright © 2022 Donghan Hu. All rights reserved.
//

import Foundation
import AppKit



class takeScreenshots{
    
    // Property to store current recording's output file URL
    private var currentOutputURL: URL?
    var tempFolderPathString: String!
    private var isRecording: Bool = false  // Add this to track recording state
    
    // Call this when user starts recording
    func startRecording() {
        isRecording = true
        setupOutputFile()  // Create output file once at start
    }
    
    // Call this when user stops recording
    func stopRecording() {
        isRecording = false
    }
    
    // return current year
    func getCurrentYear() -> String{
        let date = Date()
        let calendar = NSCalendar.current
        let year = calendar.component(.year, from: date)
        return String(year)
    }
    // return current month
    func getCurrentMonth() -> String{
        let date = Date()
        let calendar = NSCalendar.current
        let month = calendar.component(.month, from: date)
        return String(month)
    }
    // return current day
    func getCurrentDay() -> String{
        let date = Date()
        let calendar = NSCalendar.current
        let day = calendar.component(.day, from: date)
        return String(day)
    }
    
    // check and creat folder for saving screenshots
    func creatFolderForTodayRecording(){
        let currentDate = getCurrentMonth() + "-" + getCurrentDay() + "-" + getCurrentYear()
        let newRecordingFolderPath = Repository.defaultFolderPathString + currentDate
        print("screenshot folder name is: " + newRecordingFolderPath)
        
        tempFolderPathString = newRecordingFolderPath
        
        Repository.dailyScreenshotFolderString = newRecordingFolderPath
        
        if(FileManager.default.fileExists(atPath: newRecordingFolderPath)){
            print("default folder for today's screenshots is already existed!")
        }
        else{
            do {
                try FileManager.default.createDirectory(atPath: newRecordingFolderPath, withIntermediateDirectories: true, attributes: nil)
            } catch{
                print("screenshot's folder created failed!")
                print(error)
            }
        }
    }
    
    // function to check is today's folder exist. otherwise, create a new folder
    func checkTodayScreenShotFolder(folderPath: String) -> Bool{
        if(FileManager.default.fileExists(atPath: folderPath)){
            print("default folder for today's screenshots is already existed!")
            return true;
        }
        else{
            do {
                try FileManager.default.createDirectory(atPath: folderPath, withIntermediateDirectories: true, attributes: nil)
                print("created folder successfully! ")
            } catch{
                print("screenshot's folder created failed!")
                print(error)
            }
            // return false;
        }
        return false;
    }
    
    // return today's folder path
    func returnCurrentFolder() -> String{
        let currentDate = getCurrentMonth() + "-" + getCurrentDay() + "-" + getCurrentYear()
        let newRecordingFolderPath = Repository.defaultFolderPathString + currentDate
        return newRecordingFolderPath
        
    }
    
    // function to take a screenshot with customsized arguments with formatted date name
    func takeANewScreenshotWithFormattedDateName(){
        // Setup output file at the start of recording
        // setupOutputFile()
        let date = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "YYYY.MM.dd,HH-mm-ss"
        let dateString = dateFormatter.string(from: date)
        
        // MARK: check date whenever take a new screenshot
        let TodayDate = NSDate()
        let calendar = NSCalendar.current
        let TodayDay = calendar.component(.day, from: date)
        let TodayMonth = calendar.component(.month, from: date)
        let Todayyear = calendar.component(.year, from: date)
        let folderPathStringForChecking = getCurrentMonth() + "-" + getCurrentDay() + "-" + getCurrentYear()
        let fullFolderPathStringForChecking = Repository.defaultFolderPathString + folderPathStringForChecking
        if(checkTodayScreenShotFolder(folderPath: fullFolderPathStringForChecking)){
            // folder existed, not a new day
            // do nothing
            
            print("In screenshtos class, today's screenshot folder is existed")
            print("tempFolderPathString is: ", tempFolderPathString)
        } else{
            print("In screenshtos class, today's screenshot folder is existed")
            // a new day begins, saving screenshots to new folder
            
            // create new folder for new day's recording
            creatFolderForTodayRecording()
            // let newScreenshotFolderPath = Repository.defaultFolderPathString + folderPathStringForChecking
            // tempFolderPathString = newScreenshotFolderPath
            // reset
            // Repository.dailyScreenshotFolderString = newScreenshotFolderPath
        }
        
        
        
        let task = Process()
        task.launchPath = "/usr/sbin/screencapture"
        var arguments = [String]();
        arguments.append("-x")
        
        let tempScreenshotPerPathString = tempFolderPathString + "/" + dateString + ".jpg"
        arguments.append(tempScreenshotPerPathString)
        
        print("screenshot path: " + tempScreenshotPerPathString)
        
        task.arguments = arguments
        
        let outpipe = Pipe()
        task.standardOutput = outpipe
        task.standardError = outpipe
        
        do {
            try task.run()
            
        } catch {
            print("failed in taking a new screenshot")
            print(error)
        }
        
        // wait until task is finished and exit
        task.waitUntilExit()
        
        frontNameCheck()
        //pass the Screenshot path
        //gobal var, for checking the url
        // 0:25 sec
        // 10 fps = 10 screenshot per sec
        //
        
        
    }
    
    // Function to setup output file when recording starts
    func setupOutputFile() {
        // Only create new file if not already recording
        if currentOutputURL == nil {
            guard let homeURL = getPath() else {
                print("Failed to get home directory URL.")
                return
            }

            let mainDirectory = homeURL.appendingPathComponent("Documents/TimeLapseVideo")
            let outputDirectory = mainDirectory.appendingPathComponent("Output JSON")
            
            do {
                try FileManager.default.createDirectory(at: outputDirectory, withIntermediateDirectories: true)
                
                // Use date for filename instead of timestamp
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "MMddyyyy"
                let dateString = dateFormatter.string(from: Date())
                currentOutputURL = outputDirectory.appendingPathComponent("output_\(dateString).json")
                print("Created new output file at: \(currentOutputURL?.path ?? "nil")")
            } catch {
                print("Error creating directory: \(error)")
            }
        }
    }
    
    // step 1: front most applicaiton name
    // step 2: read the csv file to get applescripts
    // step 3: a for loop: getting the corresponding applescritps based on the front most application name
    // step 4: run two applesceritps individually, then save results(string formt) into a json file (an array)
    // read the json file via server.js
    // save each data (row by row) in to the mongodb
    func frontNameCheck() {
        let applescriptLoader = ApplescriptFileLoad()
        var resultsArray = [[String: Any]]() // Array to store results

        // Step 1: Get the frontmost application name
        guard let frontmostAppName = NSWorkspace.shared.frontmostApplication?.localizedName else {
            print("Unable to retrieve frontmost application name")
            return
        }
        print("Frontmost Application Name: ", frontmostAppName)

        // Step 2: Read the appropriate CSV file to get AppleScript
        let csvFileName = "applescript"

        // Step 3: Retrieve AppleScripts and process
        if let csvData = applescriptLoader.readCSV(fileName: csvFileName) {

            for row in csvData {
                if row.count >= 3 && row[0] == frontmostAppName {
                    
                    let softwareName = row[0]
                    let urlScript = row[1]
                    let nameScript = row[2]
                    
                    // Execute the URL script to get location
                    var stringResult = executeAppleScript(applescript: urlScript)
                    let locationResult = executeAppleScript(applescript: stringResult)
                    print("URL Script Result: ", locationResult)
                    
                    // Execute the name script to get filename
                    stringResult = executeAppleScript(applescript: nameScript)
                    let fileNameResult = executeAppleScript(applescript: stringResult)
                    print("Name Script Result: ", fileNameResult)
                    
                    // Get current timestamp in MMddyyyy_HHmmss format
                    let dateFormatter = DateFormatter()
                    dateFormatter.dateFormat = "MMddyyyy_HHmmss"
                    let timestamp = dateFormatter.string(from: Date())
                    
                    // Prepare dictionary for JSON
                    let softwareResult: [String: Any] = ["SoftwareName": softwareName,
                                                         "Location": locationResult,
                                                         "Filename": fileNameResult,
                                                         "Timestamp": timestamp
                                                        ]
                    
                    // Add software result to the array
                    resultsArray.append(softwareResult)
                    
                }
            }

            // Convert resultsArray to JSON Data
            do {
                guard let fileURL = currentOutputURL else {
                    print("No output file URL set")
                    return
                }

                var jsonData: Data
                if FileManager.default.fileExists(atPath: fileURL.path) {
                    // Append to existing JSON file
                    let existingData = try Data(contentsOf: fileURL)
                    let existingArray = try JSONSerialization.jsonObject(with: existingData, options: []) as? [[String: Any]] ?? []
                    var combinedArray = existingArray + resultsArray
                    jsonData = try JSONSerialization.data(withJSONObject: combinedArray, options: .prettyPrinted)
                } else {
                    // Write new JSON file
                    jsonData = try JSONSerialization.data(withJSONObject: resultsArray, options: .prettyPrinted)
                }

                // Write JSON Data to file
                try jsonData.write(to: fileURL)
                print("JSON data successfully written to: \(fileURL.path)")

            } catch {
                print("Error writing JSON data: \(error)")
            }
        } else {
            print("Failed to load or parse CSV file \(csvFileName)")
        }
    }
    
    func getPath() -> URL? {
        let pw = getpwuid(getuid())
        guard let home = pw?.pointee.pw_dir else {
            print("Error: Could not retrieve home directory.")
            return nil
        }
        let homePath = FileManager.default.string(withFileSystemRepresentation: home, length: Int(strlen(home)))
        return URL(fileURLWithPath: homePath)
    }

    
    func executeAppleScript(applescript : String) -> String{
        var error: NSDictionary?
        let scriptObject = NSAppleScript(source: applescript)
        let output: NSAppleEventDescriptor = scriptObject!.executeAndReturnError(&error)
        // print("output", output)
        if (error != nil) {
            print("error: \(String(describing: error))")
        }
        if output.stringValue == nil{
            let empty = "the result is empty"
            return empty
        }
        else {
            return (output.stringValue?.description)!
        }
    }
    
    // function to take a screenshot with increasing counter in names based changing daily
    func takeANewScreenshotWithIncreadingCounter(){
        // get  current date
        let date = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "YYYYMMdd"
        let dateString = dateFormatter.string(from: date)
        
        // generate new file name with "FRAME" ahead as an identifier
        // add counter indicating order

        let counterString = String(format: "%08d", DailyCounter.counter)
        let screenshotName = "FRAME" + String(DailyCounter.counter)
        
        let task = Process()
        task.launchPath = "/usr/sbin/screencapture"
        var arguments = [String]();
        arguments.append("-x")
        
        let tempScreenshotPerPathString = tempFolderPathString + "/" + dateString + ".jpg"
        arguments.append(tempScreenshotPerPathString)
        
        print("screenshot path: " + tempScreenshotPerPathString)
        
        task.arguments = arguments
        
        let outpipe = Pipe()
        task.standardOutput = outpipe
        task.standardError = outpipe
        
        do {
            try task.run()
            
        } catch {
            print("failed in taking a new screenshot")
            print(error)
        }
        
        // wait until task is finished and exit
        task.waitUntilExit()
        
        // increase the default counter: + 1
        DailyCounter.counter = DailyCounter.counter + 1
        
    }
    
    
    @objc func takeANewScreenshotWithFormattedDateNameTesting(){
        
        let date = Date()
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "YYYY.MM.dd,HH-mm-ss"
        let dateString = dateFormatter.string(from: date)
        
        // MARK: check date whenever take a new screenshot
        let TodayDate = NSDate()
        let calendar = NSCalendar.current
        let TodayDay = calendar.component(.day, from: date)
        let TodayMonth = calendar.component(.month, from: date)
        let Todayyear = calendar.component(.year, from: date)
        let folderPathStringForChecking = getCurrentMonth() + "-" + getCurrentDay() + "-" + getCurrentYear()
        if(checkTodayScreenShotFolder(folderPath: folderPathStringForChecking)){
            // folder existed, not a new day
            // do nothing
        } else{
            // a new day begins, saving screenshots to new folder
            let newScreenshotFolderPath = Repository.defaultFolderPathString + folderPathStringForChecking
            tempFolderPathString = newScreenshotFolderPath
            // reset
            Repository.dailyScreenshotFolderString = newScreenshotFolderPath
        }
        
        
        
        let task = Process()
        task.launchPath = "/usr/sbin/screencapture"
        var arguments = [String]();
        arguments.append("-x")
        
        let tempScreenshotPerPathString = tempFolderPathString + "/" + dateString + ".jpg"
        arguments.append(tempScreenshotPerPathString)
        
        print("screenshot path: " + tempScreenshotPerPathString)
        
        task.arguments = arguments
        
        let outpipe = Pipe()
        task.standardOutput = outpipe
        task.standardError = outpipe
        
        do {
            try task.run()
            
        } catch {
            print("failed in taking a new screenshot")
            print(error)
        }
        
        // wait until task is finished and exit
        task.waitUntilExit()
        
    }
    
    
}
