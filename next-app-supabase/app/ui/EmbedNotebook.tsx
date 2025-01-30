export default function EmbedNotebook({ notebookLink }: { notebookLink: string }) {
    return (
      <div>
        <iframe
          src={notebookLink}
          width="100%" 
          height="600px" 
          title="Wolfram Notebook"
        />
      </div>
    );
  }
  