//
//  ApplescriptFileLoad.swift
//  TimeLapseVideoProject
//
//  Created by echolab-user on 7/16/24.
//  Copyright © 2024 Donghan Hu. All rights reserved.
//

import Foundation

class ApplescriptFileLoad {
    
    // Function to read a CSV file and return its content
    func readCSV(fileName: String) -> [[String]]? {
        guard let filepath = Bundle.main.path(forResource: fileName, ofType: "csv") else {
            print("CSV file \(fileName).csv not found.")
            return nil
        }
        
        do {
            var contents = try String(contentsOfFile: filepath, encoding: .utf8)
            contents = cleanRows(file: contents)
            return csv(data: contents)
        } catch {
            print("Error reading CSV file: \(error)")
            return nil
        }
    }
    
    // Function to clean up CSV rows
    private func cleanRows(file:String) -> String {
        var cleanFile = file
        cleanFile = cleanFile.replacingOccurrences(of: "\r", with: "\n")
        cleanFile = cleanFile.replacingOccurrences(of: "\n\n", with: "\n")
        return cleanFile
    }
    
    // Function to parse CSV data into a 2D array
    private func csv(data: String) -> [[String]] {
        var result: [[String]] = []
        let rows = data.components(separatedBy: "\n")
        for row in rows {
            let columns = row.components(separatedBy: ",")
            result.append(columns)
        }
        return result
    }
}
