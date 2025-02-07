//
//  SharedTimeStamp.swift
//  TimeLapseVideoProject
//
//  Created by Arnav Jagtap on 12/26/24.
//  Copyright © 2024 Donghan Hu. All rights reserved.
//
import Foundation

class RecordingSession {
    static let shared = RecordingSession()  // Singleton
    private(set) var startTimestamp: String?
    
    func startNewRecording() {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMddyyyy_HHmmss"
        startTimestamp = dateFormatter.string(from: Date())
    }
    
    func clearSession() {
        startTimestamp = nil
    }
}
