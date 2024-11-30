export const modulesContexts = {
    "specific" : [
        {
            "name" : "Welcome",
            "title" : "Welcome to Slicer",
            "keys" : ["qSlicerWelcomeModule", "qSlicerWelcomeModuleWidget"]
        },
        {
            "name" : "Volumes",
            "keys" : ["qSlicerVolumesModule", "qSlicerVolumesModuleWidget", "qMRMLVolumeInfoWidget", "qMRMLColorLegendDisplayNodeWidget", "qSlicerScalarVolumeDisplayWidget", "VolumeDisplayPresets", "qMRMLVolumeWidget", "qMRMLWindowLevelWidget", "qSlicerDTISliceDisplayWidget", "qSlicerDiffusionTensorVolumeDisplayWidget", "qSlicerLabelMapVolumeDisplayWidget", "qSlicerSubjectHierarchyDiffusionTensorVolumesPlugin", "qSlicerSubjectHierarchyLabelMapsPlugin", "qSlicerSubjectHierarchyVolumesPlugin", "qSlicerVolumesIOOptionsWidget", "qSlicerVolumesReader"]
        },
        {
            "name" : "Volume Rendering",
            "keys" : ["qSlicerVolumeRenderingModule", "qSlicerVolumeRenderingModuleWidget", "qMRMLVolumePropertyNodeWidget", "qSlicerCPURayCastVolumeRenderingPropertiesWidget", "qSlicerGPUMemoryComboBox", "qSlicerGPURayCastVolumeRenderingPropertiesWidget", "qSlicerMultiVolumeRenderingPropertiesWidget", "qSlicerPresetComboBox", "qSlicerShaderPropertyReader", "qSlicerSubjectHierarchyVolumeRenderingPlugin", "qSlicerVolumeRenderingPresetComboBox", "qSlicerVolumeRenderingReader", "qSlicerVolumeRenderingSettingsPanel", "vtkMRMLShaderPropertyStorageNode", "vtkMRMLVolumePropertyStorageNode"]
        },
        {
            "name" : "Models",
            "keys" : ["qSlicerModelsModule", "qSlicerModelsModuleWidget", "qMRMLModelInfoWidget", "qMRMLModelDisplayNodeWidget", "qSlicerModelsIOOptionsWidget"]
        },
        {
            "name" : "Data",
            "keys" : ["qSlicerDataModule", "qSlicerDataModuleWidget", "qSlicerSceneIOOptionsWidget", "qSlicerSceneReader", "qSlicerSceneWriter"]
        },
        {
            "name" : "DICOM",
            "keys" : ["DICOM", "UtilTest", "DICOMLib.DICOMBrowser", "qSlicerDICOMExportDialog", "qSlicerSubjectHierarchyDICOMPlugin", "DICOMPatcher", "DICOMEnhancedUSVolumePlugin", "DICOMGeAbusPlugin", "DICOMImageSequencePlugin", "DICOMScalarVolumePlugin", "DICOMSlicerDataBundlePlugin", "DICOMVolumeSequencePlugin", "CLI_CreateDICOMSeries"]
        },
        {
            "name" : "Segmentations",
            "keys" : ["qSlicerSegmentationsModule", "qSlicerSegmentationsModuleWidget", "qMRMLSegmentationConversionParametersWidget", "qMRMLSegmentationDisplayNodeWidget", "qMRMLSegmentationFileExportWidget", "qMRMLSegmentationGeometryDialog", "qMRMLSegmentationGeometryWidget", "qMRMLSegmentationRepresentationsListView", "qMRMLSegmentationShow3DButton", "qMRMLSegmentsModel", "qMRMLSegmentsTableView", "qSlicerSegmentationsIOOptionsWidget", "qSlicerSegmentationsNodeWriterOptionsWidget", "qSlicerSegmentationsReader", "qSlicerSegmentationsSettingsPanel", "qSlicerSubjectHierarchySegmentationsPlugin", "qSlicerSubjectHierarchySegmentsPlugin"]
        },
        {
            "name" : "Segment Editor",
            "keys" : ["SegmentEditor", "qMRMLSegmentEditorWidget", "qSlicerSegmentEditorAbstractEffect", "qSlicerSegmentEditorEraseEffect", "qSlicerSegmentEditorPaintEffect", "qSlicerSegmentEditorScissorsEffect", "SegmentEditorEffects.AbstractScriptedSegmentEditorAutoCompleteEffect", "SegmentEditorEffects.SegmentEditorDrawEffect", "SegmentEditorEffects.SegmentEditorFillBetweenSlicesEffect", "SegmentEditorEffects.SegmentEditorGrowFromSeedsEffect", "SegmentEditorEffects.SegmentEditorHollowEffect", "SegmentEditorEffects.SegmentEditorIslandsEffect", "SegmentEditorEffects.SegmentEditorLevelTracingEffect", "SegmentEditorEffects.SegmentEditorLogicalEffect", "SegmentEditorEffects.SegmentEditorMarginEffect", "SegmentEditorEffects.SegmentEditorMaskVolumeEffect", "SegmentEditorEffects.SegmentEditorSmoothingEffect", "SegmentEditorEffects.SegmentEditorThresholdEffect", "SubjectHierarchyPlugins.SegmentEditorSubjectHierarchyPlugin"]
        },
        {
            "name" : "Segment Statistics",
            "keys" : ["SegmentStatistics", "SegmentStatisticsPlugins.ClosedSurfaceSegmentStatisticsPlugin", "SegmentStatisticsPlugins.LabelmapSegmentStatisticsPlugin", "SegmentStatisticsPlugins.ScalarVolumeSegmentStatisticsPlugin", "SegmentStatisticsPlugins.SegmentStatisticsPluginBase", "SubjectHierarchyPlugins.SegmentStatisticsSubjectHierarchyPlugin"]
        }
    ],
    "general" : [
        {
            "name": "all",
            "keys": ["DataProbe", "qSlicerAbstractCoreModule", "qMRMLNodeComboBox"]
        }
    ]
}