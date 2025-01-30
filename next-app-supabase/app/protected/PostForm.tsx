import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function PostForm({count, selectedAlgorithm, oldId, oldNotebookLink = "", oldDescription = "", onCancel}: {count: number, selectedAlgorithm: string, oldId?: string, oldNotebookLink?: string, oldDescription?: string, onCancel: () => void}) {

    const [notebookLink, setNotebookLink] = useState(oldNotebookLink);
    const [description, setDescription] = useState(oldDescription);
    const [error, setError] = useState<string | null>(null);
  
    const saveFormData = async (notebookLink: string, description: string) => {
        if (!selectedAlgorithm) {
            alert("Please select an algorithm before saving.");
            return;
        }

        try {
            const supabase = await createClient();
            const { data: userData, error: userError } = await supabase.auth.getUser()
            if (userError) throw userError
            
            if (oldId) {
                const { data, error } = await supabase
                    .from('posts')
                    .update({
                        wolfram_link: notebookLink,
                        description: description
                    })
                    .match({id: oldId});

                if (error) throw error;
            } else {
                const { data: existingPosts, error: fetchError } = await supabase
                    .from('posts')
                    .select('id')
                    .eq('user_id', userData.user.id)
                    .eq('problem_title', selectedAlgorithm)
                    .eq('wolfram_link', notebookLink);

                if (fetchError) throw fetchError;

                if (existingPosts.length > 0) {
                    alert("The same notebook link has already been posted for the selected algorithm.");
                    return;
                }

                const { data, error } = await supabase
                    .from('posts')
                    .insert({
                        user_id: userData.user.id,
                        problem_title: selectedAlgorithm,
                        wolfram_link: notebookLink,
                        description: description
                    });

                if (error) throw error;
                await supabase.from('problems').update({solution_count: count + 1}).eq('title', selectedAlgorithm);
            }


            alert('Notebook saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save notebook. Please try again.')
        }
    }

    const handleSave = () => {
        // Reset error at the start of validation
        setError(null);
        
        if (!notebookLink) {
            setError("Notebook link cannot be empty.");
            return;
        }
        const wolframcloudprefix = "https://www.wolframcloud.com/";
        if (!notebookLink.trim().startsWith(wolframcloudprefix)) {
            setError(`Invalid notebook link. It should start with ${wolframcloudprefix}.`);
            return;
        }

        saveFormData(notebookLink.trim(), description.trim());

        onCancel();
        // Reset form fields
        setNotebookLink('');
        setDescription('');
        setError(null);
    }

    const handleCancel = () => {
        onCancel();
        // Reset form fields
        setNotebookLink('');
        setDescription('');
        setError(null);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Wolfram Notebook</h2>
                <button 
                onClick={() => onCancel()}
                className="text-gray-500 hover:text-gray-700"
                >
                ✕
                </button>
            </div>
            <div className="space-y-4">
                {error && (
                <div className="text-red-500 text-sm">{error}</div>
                )}
                <div>
                <input
                    type="text"
                    placeholder="Wolfram Notebook Public Link (required)"
                    value={notebookLink}
                    onChange={(e) => setNotebookLink(e.target.value)}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    required
                />
                </div>
                <div>
                    <textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="flex space-x-3 pt-4">
                <button 
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                    Save
                </button>
                <button 
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200"
                >
                    Cancel
                </button>
                </div>
            </div>
            </div>
        </div>
    )
}