import { useContext, useEffect, useRef, useState } from "react";
import { OpenAIActionSolutionsMapContext } from "@/app/Contexts";
import { useSessionStorageState } from "@/app/Components/Hooks/useSessionStorage";
import { OpenAIResponse } from "@/app/types/OpenAI";

// Generic node — any integration's element just needs these basics
export interface TreeNode {
    id: string;
    type: string;
    title: string;
    description: string;
    children: TreeNode[];
}

export interface SelectedElement<T extends TreeNode> {
    data: T;
}

interface UseElementTreeOptions<T extends TreeNode> {
    integrationKey: string;
    storagePrefix: string; // e.g. "devops", "clickup"
    responseType: string;  // e.g. "devops_tasks", "clickup_tasks"
    extractElements: (response: OpenAIResponse) => T[];
    buildResponse: (elements: T[]) => OpenAIResponse;
}

export function useElementTree<T extends TreeNode>({
    integrationKey,
    storagePrefix,
    responseType,
    extractElements,
    buildResponse,
}: UseElementTreeOptions<T>) {
    const { OpenAISolutionsMap, setOpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext);

    const saved = OpenAISolutionsMap.get(integrationKey);
    const savedElements = saved?.type === responseType ? extractElements(saved) : [];

    const { value: elements, setValue: setElements } = useSessionStorageState<T[]>({
        key: `${storagePrefix}:aielements:${integrationKey}`,
        initialValue: savedElements,
    });

    const [selectedElement, setSelectedElement] = useState<SelectedElement<T> | null>(null);

    const didHydrateRef = useRef(false);

    // Re-hydrate when integrationKey changes
    const prevKeyRef = useRef(integrationKey);

    useEffect(() => {
        if (prevKeyRef.current === integrationKey && didHydrateRef.current) return;
        prevKeyRef.current = integrationKey;

        const saved = OpenAISolutionsMap.get(integrationKey);
        const freshElements = saved?.type === responseType ? extractElements(saved) : [];

        setElements(freshElements);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedElement(null);
        didHydrateRef.current = true;
    }, [integrationKey]);

    // Sync back to map
    useEffect(() => {
        if (!didHydrateRef.current) {
            didHydrateRef.current = true;
            return;
        }
        setOpenAISolutionsMap(integrationKey, buildResponse(elements));
    }, [elements, integrationKey]);

    // ── Generic tree operations ───────────────────────────

    const removeNode = (nodes: T[], idToRemove: string): T[] =>
        nodes
            .filter(n => n.id !== idToRemove)
            .map(n => ({ ...n, children: removeNode(n.children as T[], idToRemove) }));

    const addChildById = (nodes: T[], parentId: string, child: T): T[] =>
        nodes.map(n => {
            if (n.id === parentId) return { ...n, children: [...(n.children ?? []), child] };
            return { ...n, children: addChildById(n.children as T[], parentId, child) };
        });

    const updateNodeById = (nodes: T[], id: string, patch: Partial<T>): T[] =>
        nodes.map(n => {
            if (n.id === id) return { ...n, ...patch };
            return { ...n, children: updateNodeById(n.children as T[], id, patch) };
        });

    // ── Public API ────────────────────────────────────────

    const select = (el: SelectedElement<T>) => setSelectedElement(el);

    const remove = (id: string) => {
        setElements(prev => removeNode(prev, id));
        if (selectedElement?.data.id === id) setSelectedElement(null);
    };

    const addChild = (parentId: string, child: T) => {
        setElements(prev => addChildById(prev, parentId, child));
        setSelectedElement({ data: child });
    };

    const addRoot = (node: T) => {
        setElements(prev => [...prev, node]);
        setSelectedElement({ data: node });
    };

    const update = (id: string, patch: Partial<T>) => {
        setSelectedElement(prev => {
            if (!prev || prev.data.id !== id) return prev;
            return { data: { ...prev.data, ...patch } };
        });
        setElements(prev => updateNodeById(prev, id, patch));
    };

    const applyToTree = (fn: (node: T) => T) => {
        const walk = (nodes: T[]): T[] =>
            nodes.map(n => fn({ ...n, children: walk(n.children as T[]) } as T));
        setElements(prev => walk(prev));
    };

    return {
        elements,
        setElements,
        selectedElement,
        select,
        remove,
        addChild,
        addRoot,
        update,
        applyToTree,
    };
}