export interface ProjectGroups {
    id:          string;
    project:     Project;
    fingerprint: string;
    firstSeen:   Date;
    lastSeen:    Date;
    occurrences: number;
}

export interface Project {
    id:   string;
    name: string;
}
