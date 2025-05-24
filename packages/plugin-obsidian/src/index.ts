import type { Plugin } from "@elizaos/core";
import { searchAction } from "./actions/search";
import { listNotesAction } from "./actions/listNotes";
import { listAllFilesAction } from "./actions/vault";
import { listDirectoryAction } from "./actions/vaultDirectory";
import { createKnowledgeAction } from "./actions/createKnowledge";
import { noteTraversalAction } from "./actions/noteTraversal";
import {
    getActiveNoteAction,
    summarizeActiveNoteAction,
} from "./actions/activeNote";
import { getNoteAction } from "./actions/note";
import { readFileAction } from "./actions/file";
import { saveFileAction } from "./actions/saveFile";
import { openFileAction } from "./actions/openFile";
import { updateFileAction } from "./actions/updateFile";
import { quartzSetupAction } from "./actions/quartzSetupArweave";
import { quartzPublishAction } from "./actions/quartzPublishArweave";
import { quartzDiagnoseAction } from "./actions/quartzDiagnose";
import { arweaveSetupAction } from "./actions/arweaveSetup";
import { quartzPreviewAction } from "./actions/quartzPreview";
import { loadRdfAction } from "./actions/loadRDF";
import { viewRdfAction } from "./actions/viewRDFGraph";
import { generateOntologyAction } from "./actions/generateOntology";

export const obsidianPlugin: Plugin = {
    name: "obsidian",
    description: "Integration with Obsidian vault using Omnisearch / Deep traversal search, memoryknowledge base, and Quartz publishing capabilities",
    actions: [
        searchAction,
        listNotesAction,
        listAllFilesAction,
        listDirectoryAction,
        summarizeActiveNoteAction,
        getActiveNoteAction,
        getNoteAction,
        readFileAction,
        createKnowledgeAction,
        noteTraversalAction,
        saveFileAction,
        openFileAction,
        updateFileAction,
        quartzSetupAction,
        quartzPublishAction,
        quartzDiagnoseAction,
        arweaveSetupAction,
        quartzPreviewAction,
        loadRdfAction,
        viewRdfAction,
        generateOntologyAction
    ],
    evaluators: [],
    services: [],
    providers: [],
};

export default obsidianPlugin;