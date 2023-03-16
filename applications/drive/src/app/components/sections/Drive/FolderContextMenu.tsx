import { useEffect } from 'react';
import * as React from 'react';

import { ContextMenu, ContextSeparator } from '@proton/components';

import useActiveShare from '../../../hooks/drive/useActiveShare';
import { useFileUploadInput, useFolderUploadInput } from '../../../store';
import { useCreateFileModal } from '../../CreateFileModal';
import { useCreateFolderModal } from '../../CreateFolderModal';
import { ContextMenuProps } from '../../FileBrowser/interface';
import { useFileSharingModal } from '../../SelectLinkToShareModal/SelectLinkToShareModal';
import { ShareFileButton } from '../ContextMenu/buttons';
import useIsEditEnabled from '../useIsEditEnabled';
import { CreateNewFileButton, CreateNewFolderButton, UploadFileButton, UploadFolderButton } from './ContextMenuButtons';

export function FolderContextMenu({
    shareId,
    anchorRef,
    isOpen,
    position,
    open,
    close,
    isActiveLinkReadOnly,
}: ContextMenuProps & {
    shareId: string;
    isActiveLinkReadOnly?: boolean;
}) {
    useEffect(() => {
        if (position) {
            open();
        }
    }, [position]);

    const isEditEnabled = useIsEditEnabled();

    const { activeFolder } = useActiveShare();
    const {
        inputRef: fileInput,
        handleClick: fileClick,
        handleChange: fileChange,
    } = useFileUploadInput(activeFolder.shareId, activeFolder.linkId);
    const {
        inputRef: folderInput,
        handleClick: folderClick,
        handleChange: folderChange,
    } = useFolderUploadInput(activeFolder.shareId, activeFolder.linkId);
    const [createFolderModal, showCreateFolderModal] = useCreateFolderModal();
    const [createFileModal, showCreateFileModal] = useCreateFileModal();
    const [fileSharingModal, showFileSharingModal] = useFileSharingModal();

    // ContextMenu is removed from DOM when any action is executed but inputs
    // need to stay rendered so onChange handler can work.
    return (
        <>
            <input multiple type="file" ref={fileInput} className="hidden" onChange={fileChange} />
            <input type="file" ref={folderInput} className="hidden" onChange={folderChange} />
            {createFolderModal}
            {createFileModal}
            {fileSharingModal}
            <ContextMenu isOpen={isOpen} close={close} position={position} anchorRef={anchorRef}>
                {!isActiveLinkReadOnly && <CreateNewFolderButton close={close} action={showCreateFolderModal} />}
                {isEditEnabled && !isActiveLinkReadOnly && (
                    <CreateNewFileButton close={close} action={showCreateFileModal} />
                )}
                {!isActiveLinkReadOnly && <ContextSeparator />}
                {!isActiveLinkReadOnly ? (
                    <>
                        <UploadFileButton close={close} onClick={fileClick} />
                        <UploadFolderButton close={close} onClick={folderClick} />
                        <ContextSeparator />
                    </>
                ) : null}
                <ShareFileButton close={close} action={() => showFileSharingModal({ shareId })} />
            </ContextMenu>
        </>
    );
}
